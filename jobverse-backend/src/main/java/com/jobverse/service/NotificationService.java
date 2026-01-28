package com.jobverse.service;

import com.jobverse.entity.Application;
import com.jobverse.entity.Notification;
import com.jobverse.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Async
    public void sendApplicationNotification(Application application) {
        try {
            // Notify candidate
            Notification candidateNotification = Notification.builder()
                    .user(application.getUser())
                    .type(Notification.NotificationType.APPLICATION)
                    .title("Đơn ứng tuyển đã được gửi")
                    .content("Bạn đã ứng tuyển thành công vị trí " + application.getJob().getTitle() + 
                            " tại " + application.getJob().getCompany().getName())
                    .actionUrl("/applications/" + application.getId())
                    .build();
            notificationRepository.save(candidateNotification);
            
            // Notify employer (if postedBy exists)
            if (application.getJob().getPostedBy() != null) {
                Notification employerNotification = Notification.builder()
                        .user(application.getJob().getPostedBy())
                        .type(Notification.NotificationType.APPLICATION)
                        .title("Có ứng viên mới")
                        .content("Có ứng viên mới ứng tuyển vị trí " + application.getJob().getTitle())
                        .actionUrl("/employer/applications/" + application.getId())
                        .build();
                notificationRepository.save(employerNotification);
                
                // Send email to employer
                String candidateName = application.getUser().getProfile() != null ?
                        application.getUser().getProfile().getFullName() : application.getUser().getEmail();
                emailService.sendNewApplicationNotification(
                        application.getJob().getPostedBy(),
                        candidateName,
                        application.getJob().getTitle()
                );
            }
            
            // Send email to candidate
            emailService.sendApplicationConfirmation(
                    application.getUser(),
                    application.getJob().getTitle(),
                    application.getJob().getCompany().getName()
            );
            
            log.info("Application notifications sent for application: {}", application.getId());
        } catch (Exception e) {
            log.error("Error sending application notification: {}", e.getMessage(), e);
            // Don't throw - notification failure shouldn't fail the application
        }
    }
    
    @Async
    public void sendStatusUpdateNotification(Application application) {
        Notification notification = Notification.builder()
                .user(application.getUser())
                .type(Notification.NotificationType.STATUS_UPDATE)
                .title("Cập nhật trạng thái đơn ứng tuyển")
                .content("Đơn ứng tuyển của bạn cho vị trí " + application.getJob().getTitle() +
                        " đã được cập nhật: " + application.getStatus())
                .actionUrl("/applications/" + application.getId())
                .build();
        notificationRepository.save(notification);
        // Send real-time notification via WebSocket
        sendRealTimeNotification(notification);

        log.info("Status update notification sent for application: {}", application.getId());
    }

    /**
     * Send real-time notification to user via WebSocket
     * Uses /queue/notifications/{userId} for user-specific delivery
     */
    private void sendRealTimeNotification(Notification notification) {
        try {
            String destination = "/queue/notifications/" + notification.getUser().getId();
            messagingTemplate.convertAndSend(destination, notification);
            log.info("🔔 Real-time notification sent to user {} via WebSocket", notification.getUser().getId());
        } catch (Exception e) {
            log.error("❌ Failed to send real-time notification via WebSocket: {}", e.getMessage());
            // Don't throw exception - notification is already saved in DB
        }
    }

    @Async
    public void sendApplicationStatusUpdateNotification(Application application) {
        Notification notification = Notification.builder()
                .user(application.getUser())
                .type(Notification.NotificationType.APPLICATION)
                .title("Trạng thái đơn ứng tuyển đã thay đổi")
                .content("Đơn ứng tuyển " + application.getJob().getTitle() +
                        " của bạn đã chuyển sang trạng thái: " + application.getStatus())
                .actionUrl("/applications/" + application.getId())
                .build();

        Notification saved = notificationRepository.save(notification);
        sendRealTimeNotification(saved);

        log.info("Application status update notification sent to user {}", application.getUser().getId());
    }
}
