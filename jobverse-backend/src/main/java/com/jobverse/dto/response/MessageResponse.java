package com.jobverse.dto.response;

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
public class MessageResponse {

    private Long id;
    private Long conversationId;
    private String senderType;  // COMPANY or CANDIDATE
    private Long senderId;       // Company ID or Candidate User ID
    private Long senderUserId;   // Actual user ID who sent the message (for frontend comparison)
    private String senderName;
    private String senderAvatarUrl;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private boolean isRead;

    public static MessageResponse fromEntity(Message message, String senderName, String senderAvatarUrl, Long senderUserId) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderType(message.getSenderType().name())
                .senderId(message.getSenderId())
                .senderUserId(senderUserId)
                .senderName(senderName)
                .senderAvatarUrl(senderAvatarUrl)
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .readAt(message.getReadAt())
                .isRead(message.isRead())
                .build();
    }
}
