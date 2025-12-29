package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.entity.Notification;
import com.jobverse.repository.NotificationRepository;
import com.jobverse.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST API for managing notifications
 * Provides endpoints for fetching, marking as read, and managing user notifications
 */
@Slf4j
@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management APIs")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    /**
     * Get paginated list of notifications for current user
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user notifications", description = "Get paginated list of notifications for authenticated user")
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable
    ) {
        log.info("📬 Fetching notifications for user: {}", userPrincipal.getId());
        Page<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userPrincipal.getId(), pageable);

        return ResponseEntity.ok(ApiResponse.success(
                "Notifications retrieved successfully",
                notifications
        ));
    }

    /**
     * Get count of unread notifications
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread count", description = "Get number of unread notifications")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        long count = notificationRepository.countByUserIdAndIsRead(userPrincipal.getId(), false);
        log.info("🔢 Unread notifications count for user {}: {}", userPrincipal.getId(), count);

        return ResponseEntity.ok(ApiResponse.success(
                "Unread count retrieved",
                count
        ));
    }

    /**
     * Mark a notification as read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark as read", description = "Mark a specific notification as read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("✅ Marking notification {} as read for user {}", id, userPrincipal.getId());

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Ensure user owns this notification
        if (!notification.getUser().getId().equals(userPrincipal.getId())) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok(ApiResponse.success(
                "Notification marked as read",
                notification
        ));
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read for current user")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("✅ Marking all notifications as read for user {}", userPrincipal.getId());

        notificationRepository.markAllAsReadForUser(userPrincipal.getId());

        return ResponseEntity.ok(ApiResponse.success(
                "All notifications marked as read",
                null
        ));
    }

    /**
     * Delete a notification
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete notification", description = "Delete a specific notification")
    public ResponseEntity<ApiResponse<String>> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("🗑️ Deleting notification {} for user {}", id, userPrincipal.getId());

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Ensure user owns this notification
        if (!notification.getUser().getId().equals(userPrincipal.getId())) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notificationRepository.delete(notification);

        return ResponseEntity.ok(ApiResponse.success(
                "Notification deleted successfully",
                null
        ));
    }
}
