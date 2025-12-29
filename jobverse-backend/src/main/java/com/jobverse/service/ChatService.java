package com.jobverse.service;

import com.jobverse.dto.request.CreateConversationRequest;
import com.jobverse.dto.request.SendMessageRequest;
import com.jobverse.dto.response.ConversationResponse;
import com.jobverse.dto.response.MessageResponse;
import com.jobverse.entity.*;
import com.jobverse.exception.BadRequestException;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.exception.UnauthorizedException;
import com.jobverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    
    /**
     * Create or get existing conversation
     */
    @Transactional
    public ConversationResponse createOrGetConversation(CreateConversationRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Long companyId;
        Long candidateId;
        
        if (currentUser.getRole() == User.Role.EMPLOYER) {
            // Employer initiating - use their company
            Company company = companyRepository.findByOwnerId(currentUserId)
                    .orElseThrow(() -> new BadRequestException("No company found for employer"));
            companyId = company.getId();
            
            if (request.getCandidateUserId() == null) {
                throw new BadRequestException("candidateUserId is required for employer");
            }
            candidateId = request.getCandidateUserId();
            
            // Verify candidate exists and is a candidate
            User candidate = userRepository.findById(candidateId)
                    .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
            if (candidate.getRole() != User.Role.CANDIDATE) {
                throw new BadRequestException("Target user is not a candidate");
            }
        } else if (currentUser.getRole() == User.Role.CANDIDATE) {
            // Candidate initiating
            if (request.getCompanyId() == null) {
                throw new BadRequestException("companyId is required for candidate");
            }
            companyId = request.getCompanyId();
            candidateId = currentUserId;

            // Verify company exists
            if (!companyRepository.existsById(companyId)) {
                throw new ResourceNotFoundException("Company not found");
            }

            // Check if candidate has applied to any job of this company
            boolean hasAppliedToCompany = applicationRepository.existsByUserIdAndCompanyId(currentUserId, companyId);
            if (!hasAppliedToCompany) {
                throw new BadRequestException("Bạn cần ứng tuyển ít nhất một công việc của công ty này trước khi nhắn tin");
            }
        } else {
            throw new UnauthorizedException("Only employers and candidates can use chat");
        }
        
        // Check if conversation already exists
        Optional<Conversation> existingConv;
        if (request.getJobId() != null) {
            existingConv = conversationRepository.findByCompanyIdAndCandidateIdAndJobId(
                    companyId, candidateId, request.getJobId());
        } else {
            existingConv = conversationRepository.findByCompanyIdAndCandidateIdAndJobIsNull(
                    companyId, candidateId);
        }
        
        if (existingConv.isPresent()) {
            return mapToResponse(existingConv.get(), currentUser.getRole());
        }
        
        // Create new conversation
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
        
        Conversation conversation = Conversation.builder()
                .company(company)
                .candidate(candidate)
                .build();
        
        if (request.getJobId() != null) {
            Job job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
            conversation.setJob(job);
        }
        
        conversation = conversationRepository.save(conversation);
        log.info("💬 Created new conversation: company={}, candidate={}", companyId, candidateId);
        
        return mapToResponse(conversation, currentUser.getRole());
    }
    
    /**
     * Get conversations for current user
     */
    @Transactional(readOnly = true)
    public Page<ConversationResponse> getMyConversations(Long currentUserId, Pageable pageable) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Page<Conversation> conversations;
        
        if (currentUser.getRole() == User.Role.EMPLOYER) {
            Company company = companyRepository.findByOwnerId(currentUserId)
                    .orElseThrow(() -> new BadRequestException("No company found for employer"));
            conversations = conversationRepository.findByCompanyIdOrderByLastMessageAtDesc(
                    company.getId(), pageable);
        } else if (currentUser.getRole() == User.Role.CANDIDATE) {
            conversations = conversationRepository.findByCandidateIdOrderByLastMessageAtDesc(
                    currentUserId, pageable);
        } else {
            throw new UnauthorizedException("Only employers and candidates can use chat");
        }
        
        return conversations.map(conv -> mapToResponse(conv, currentUser.getRole()));
    }
    
    /**
     * Get messages for a conversation
     */
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(Long conversationId, Long currentUserId, Pageable pageable) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Verify access
        verifyConversationAccess(conversationId, currentUser);
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        
        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(
                conversationId, pageable);
        
        return messages.map(msg -> mapMessageToResponse(msg, conversation));
    }
    
    /**
     * Send a message
     */
    @Transactional
    public MessageResponse sendMessage(Long conversationId, SendMessageRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        
        // Verify access
        verifyConversationAccess(conversationId, currentUser);
        
        Message.SenderType senderType;
        Long senderId;
        
        if (currentUser.getRole() == User.Role.EMPLOYER) {
            senderType = Message.SenderType.COMPANY;
            senderId = conversation.getCompany().getId();
        } else {
            senderType = Message.SenderType.CANDIDATE;
            senderId = currentUserId;
        }
        
        Message message = Message.builder()
                .conversation(conversation)
                .senderType(senderType)
                .senderId(senderId)
                .content(request.getContent())
                .build();
        
        message = messageRepository.save(message);
        
        // Update conversation's lastMessageAt
        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);
        
        log.info("💬 Message sent in conversation {}: {} by {}", conversationId, 
                request.getContent().length() > 50 ? request.getContent().substring(0, 50) + "..." : request.getContent(),
                currentUser.getEmail());
        
        return mapMessageToResponse(message, conversation);
    }
    
    /**
     * Mark messages as read
     */
    @Transactional
    public void markAsRead(Long conversationId, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        verifyConversationAccess(conversationId, currentUser);
        
        // Mark messages from the other party as read
        Message.SenderType otherPartyType = currentUser.getRole() == User.Role.EMPLOYER 
                ? Message.SenderType.CANDIDATE 
                : Message.SenderType.COMPANY;
        
        int updated = messageRepository.markAsRead(conversationId, otherPartyType, LocalDateTime.now());
        log.info("📖 Marked {} messages as read in conversation {}", updated, conversationId);
    }
    
    private void verifyConversationAccess(Long conversationId, User user) {
        if (user.getRole() == User.Role.EMPLOYER) {
            Company company = companyRepository.findByOwnerId(user.getId())
                    .orElseThrow(() -> new BadRequestException("No company found for employer"));
            if (!conversationRepository.existsByIdAndCompanyId(conversationId, company.getId())) {
                throw new UnauthorizedException("You don't have access to this conversation");
            }
        } else if (user.getRole() == User.Role.CANDIDATE) {
            if (!conversationRepository.existsByIdAndCandidateId(conversationId, user.getId())) {
                throw new UnauthorizedException("You don't have access to this conversation");
            }
        } else {
            throw new UnauthorizedException("Only employers and candidates can use chat");
        }
    }
    
    private ConversationResponse mapToResponse(Conversation conv, User.Role viewerRole) {
        Message lastMessage = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conv.getId());
        
        long unreadCount;
        if (viewerRole == User.Role.EMPLOYER) {
            unreadCount = messageRepository.countUnreadForCompany(conv.getId());
        } else {
            unreadCount = messageRepository.countUnreadForCandidate(conv.getId());
        }
        
        return ConversationResponse.fromEntity(conv, lastMessage, unreadCount);
    }
    
    private MessageResponse mapMessageToResponse(Message msg, Conversation conversation) {
        String senderName;
        String senderAvatarUrl;
        
        if (msg.getSenderType() == Message.SenderType.COMPANY) {
            senderName = conversation.getCompany().getName();
            senderAvatarUrl = conversation.getCompany().getLogoUrl();
        } else {
            User candidate = conversation.getCandidate();
            senderName = candidate.getProfile() != null 
                    ? candidate.getProfile().getFullName() 
                    : candidate.getEmail();
            senderAvatarUrl = candidate.getProfile() != null 
                    ? candidate.getProfile().getAvatarUrl() 
                    : null;
        }
        
        return MessageResponse.fromEntity(msg, senderName, senderAvatarUrl);
    }
}
