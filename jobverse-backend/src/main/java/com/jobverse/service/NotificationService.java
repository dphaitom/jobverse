package com.jobverse.service;

import com.jobverse.entity.Application;
import com.jobverse.entity.Notification;
import com.jobverse.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    
    @Async
    public void sendApplicationNotification(Application application) {
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
        
        // Notify employer
        Notification employerNotification = Notification.builder()
                .user(application.getJob().getPostedBy())
                .type(Notification.NotificationType.APPLICATION)
                .title("Có ứng viên mới")
                .content("Có ứng viên mới ứng tuyển vị trí " + application.getJob().getTitle())
                .actionUrl("/employer/applications/" + application.getId())
                .build();
        notificationRepository.save(employerNotification);
        
        // Send emails
        emailService.sendApplicationConfirmation(
                application.getUser(),
                application.getJob().getTitle(),
                application.getJob().getCompany().getName()
        );
        
        String candidateName = application.getUser().getProfile() != null ?
                application.getUser().getProfile().getFullName() : application.getUser().getEmail();
        emailService.sendNewApplicationNotification(
                application.getJob().getPostedBy(),
                candidateName,
                application.getJob().getTitle()
        );
        
        log.info("Application notifications sent for application: {}", application.getId());
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
        
        log.info("Status update notification sent for application: {}", application.getId());
    }
}
