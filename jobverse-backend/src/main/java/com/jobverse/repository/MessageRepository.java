package com.jobverse.repository;

import com.jobverse.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Get messages for a conversation (paged, newest first)
    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);
    
    // Get latest message for a conversation (uses Spring Data naming convention)
    Message findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);
    
    // Count unread messages for candidate in a conversation
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND m.senderType = 'COMPANY' AND m.readAt IS NULL")
    long countUnreadForCandidate(Long conversationId);
    
    // Count unread messages for company in a conversation
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND m.senderType = 'CANDIDATE' AND m.readAt IS NULL")
    long countUnreadForCompany(Long conversationId);
    
    // Mark messages as read
    @Modifying
    @Query("UPDATE Message m SET m.readAt = :readAt WHERE m.conversation.id = :conversationId " +
           "AND m.senderType = :senderType AND m.readAt IS NULL")
    int markAsRead(Long conversationId, Message.SenderType senderType, LocalDateTime readAt);
}
