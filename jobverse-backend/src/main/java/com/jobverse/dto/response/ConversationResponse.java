package com.jobverse.dto.response;

import com.jobverse.entity.Conversation;
import com.jobverse.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    
    private Long id;
    private CompanyInfo company;
    private CandidateInfo candidate;
    private JobInfo job;  // nullable
    private MessageInfo lastMessage;
    private long unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyInfo {
        private Long id;
        private String name;
        private String logoUrl;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateInfo {
        private Long id;
        private String fullName;
        private String avatarUrl;
        private String email;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobInfo {
        private Long id;
        private String title;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageInfo {
        private Long id;
        private String content;
        private String senderType;
        private LocalDateTime createdAt;
        private boolean isRead;
    }
    
    public static ConversationResponse fromEntity(Conversation conv, Message lastMsg, long unreadCount) {
        ConversationResponseBuilder builder = ConversationResponse.builder()
                .id(conv.getId())
                .company(CompanyInfo.builder()
                        .id(conv.getCompany().getId())
                        .name(conv.getCompany().getName())
                        .logoUrl(conv.getCompany().getLogoUrl())
                        .build())
                .candidate(CandidateInfo.builder()
                        .id(conv.getCandidate().getId())
                        .fullName(conv.getCandidate().getProfile() != null 
                                ? conv.getCandidate().getProfile().getFullName() 
                                : conv.getCandidate().getEmail())
                        .avatarUrl(conv.getCandidate().getProfile() != null 
                                ? conv.getCandidate().getProfile().getAvatarUrl() 
                                : null)
                        .email(conv.getCandidate().getEmail())
                        .build())
                .unreadCount(unreadCount)
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt());
        
        if (conv.getJob() != null) {
            builder.job(JobInfo.builder()
                    .id(conv.getJob().getId())
                    .title(conv.getJob().getTitle())
                    .build());
        }
        
        if (lastMsg != null) {
            builder.lastMessage(MessageInfo.builder()
                    .id(lastMsg.getId())
                    .content(lastMsg.getContent().length() > 100 
                            ? lastMsg.getContent().substring(0, 100) + "..." 
                            : lastMsg.getContent())
                    .senderType(lastMsg.getSenderType().name())
                    .createdAt(lastMsg.getCreatedAt())
                    .isRead(lastMsg.isRead())
                    .build());
        }
        
        return builder.build();
    }
}
