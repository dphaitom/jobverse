package com.jobverse.service;

import com.jobverse.dto.request.ApplicationRequest;
import com.jobverse.entity.Application;
import com.jobverse.entity.Job;
import com.jobverse.entity.Resume;
import com.jobverse.entity.User;
import com.jobverse.repository.ApplicationRepository;
import com.jobverse.repository.JobRepository;
import com.jobverse.repository.ResumeRepository;
import com.jobverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final NotificationService notificationService;

    @Transactional
    public Application createApplication(ApplicationRequest request, Long userId) {
        log.info("User {} applying for job {}", userId, request.getJobId());

        // Check if already applied
        if (applicationRepository.existsByJobIdAndUserId(request.getJobId(), userId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        // Get job and user
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get resume if provided
        Resume resume = null;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElse(null);
        }

        // Create application
        Application application = Application.builder()
                .job(job)
                .user(user)
                .resume(resume)
                .coverLetter(request.getCoverLetter())
                .expectedSalary(request.getExpectedSalary())
                .isQuickApply(request.getIsQuickApply() != null ? request.getIsQuickApply() : false)
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
                .status(Application.ApplicationStatus.PENDING)
                .build();

        Application saved = applicationRepository.save(application);

        // Increment application count
        jobRepository.incrementApplicationCount(job.getId());

        // Send notification to employer
        try {
            notificationService.sendApplicationNotification(saved);
        } catch (Exception e) {
            log.error("Failed to send application notification: {}", e.getMessage());
        }

        log.info("Application created with ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public Application quickApply(Long jobId, Long userId) {
        log.info("User {} quick applying for job {}", userId, jobId);

        // Check if already applied
        if (applicationRepository.existsByJobIdAndUserId(jobId, userId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        // Get job and user
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get user's primary resume
        Resume defaultResume = resumeRepository.findByUserIdAndIsPrimaryTrue(userId)
                .orElse(null);

        // Create quick application with minimal info
        Application application = Application.builder()
                .job(job)
                .user(user)
                .resume(defaultResume)
                .coverLetter("Đơn ứng tuyển nhanh") // Quick apply default message
                .isQuickApply(true)
                .isAnonymous(false)
                .status(Application.ApplicationStatus.PENDING)
                .build();

        Application saved = applicationRepository.save(application);

        // Increment application count
        jobRepository.incrementApplicationCount(job.getId());

        // Eagerly fetch related entities to avoid LazyInitializationException
        if (saved.getJob() != null) {
            saved.getJob().getTitle(); // Initialize job
            if (saved.getJob().getCompany() != null) {
                saved.getJob().getCompany().getName(); // Initialize company
            }
        }
        if (saved.getUser() != null && saved.getUser().getProfile() != null) {
            saved.getUser().getProfile().getFullName(); // Initialize profile
        }

        // Send notification (async, doesn't need to block)
        try {
            notificationService.sendApplicationNotification(saved);
        } catch (Exception e) {
            log.error("Failed to send application notification: {}", e.getMessage());
        }

        log.info("Quick application created with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Check if user has already applied for a job
     */
    public boolean hasApplied(Long userId, Long jobId) {
        return applicationRepository.existsByJobIdAndUserId(jobId, userId);
    }

    @Transactional(readOnly = true)
    public Page<Application> getUserApplications(Long userId, Pageable pageable) {
        return applicationRepository.findByUserIdOrderByAppliedAtDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Application> getJobApplications(Long jobId, Pageable pageable) {
        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId, pageable);
    }

    @Transactional
    public Application updateApplicationStatus(Long applicationId, Application.ApplicationStatus status, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Check ownership (employer can update their job's applications)
        if (!application.getJob().getPostedBy().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this application");
        }

        application.setStatus(status);
        Application updated = applicationRepository.save(application);

        // Notify candidate about status change
        try {
            notificationService.sendApplicationStatusUpdateNotification(updated);
        } catch (Exception e) {
            log.error("Failed to send status update notification: {}", e.getMessage());
        }

        log.info("Application {} status updated to {}", applicationId, status);
        return updated;
    }

    @Transactional
    public void withdrawApplication(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Only owner can withdraw
        if (!application.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only withdraw your own applications");
        }

        application.setStatus(Application.ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);

        log.info("Application {} withdrawn by user {}", applicationId, userId);
    }
}
