package com.jobverse.controller;

import com.jobverse.dto.request.CreateConversationRequest;
import com.jobverse.dto.request.SendMessageRequest;
import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.ConversationResponse;
import com.jobverse.dto.response.MessageResponse;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/v1/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Chat APIs for employer-candidate communication")
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create or get existing conversation")
    public ResponseEntity<ApiResponse<ConversationResponse>> createOrGetConversation(
            @RequestBody CreateConversationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("💬 POST /v1/chat/conversations by user {}", currentUser.getId());
        
        ConversationResponse conversation = chatService.createOrGetConversation(request, currentUser.getId());
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Conversation ready", conversation));
    }
    
    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my conversations")
    public ResponseEntity<ApiResponse<Page<ConversationResponse>>> getMyConversations(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(size = 20, sort = "lastMessageAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("💬 GET /v1/chat/conversations by user {}", currentUser.getId());
        
        Page<ConversationResponse> conversations = chatService.getMyConversations(currentUser.getId(), pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved", conversations));
    }
    
    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get messages in a conversation")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getMessages(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("💬 GET /v1/chat/conversations/{}/messages by user {}", id, currentUser.getId());
        
        Page<MessageResponse> messages = chatService.getMessages(id, currentUser.getId(), pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved", messages));
    }
    
    @PostMapping("/conversations/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Send a message")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("💬 POST /v1/chat/conversations/{}/messages by user {}", id, currentUser.getId());
        
        MessageResponse message = chatService.sendMessage(id, request, currentUser.getId());
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Message sent", message));
    }
    
    @PutMapping("/conversations/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark conversation messages as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("📖 PUT /v1/chat/conversations/{}/read by user {}", id, currentUser.getId());
        
        chatService.markAsRead(id, currentUser.getId());
        
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }
}
