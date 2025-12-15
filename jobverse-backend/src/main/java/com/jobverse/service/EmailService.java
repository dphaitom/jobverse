package com.jobverse.service;

import com.jobverse.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {
    
    @Async
    public void sendVerificationEmail(User user) {
        // TODO: Implement real email sending
        log.info("📧 [MOCK] Verification email sent to: {}", user.getEmail());
    }
    
    @Async
    public void sendPasswordResetEmail(User user) {
        // TODO: Implement real email sending
        log.info("📧 [MOCK] Password reset email sent to: {}", user.getEmail());
    }
    
    @Async
    public void sendApplicationConfirmation(User user, String jobTitle, String companyName) {
        log.info("📧 [MOCK] Application confirmation sent to: {} for job: {} at {}", 
                user.getEmail(), jobTitle, companyName);
    }
    
    @Async
    public void sendNewApplicationNotification(User employer, String candidateName, String jobTitle) {
        log.info("📧 [MOCK] New application notification sent to: {} - Candidate: {} for job: {}", 
                employer.getEmail(), candidateName, jobTitle);
    }
}
