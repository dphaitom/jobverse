// File: src/main/java/com/jobverse/service/ApplicationService.java

package com.jobverse.service;

import com.jobverse.dto.request.ApplicationRequest;
import com.jobverse.dto.request.UpdateApplicationStatusRequest;
import com.jobverse.dto.response.ApplicationResponse;
import com.jobverse.entity.Application;
import com.jobverse.entity.Job;
import com.jobverse.entity.User;
import com.jobverse.exception.BadRequestException;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.exception.UnauthorizedException;
import com.jobverse.repository.ApplicationRepository;
import com.jobverse.repository.JobRepository;
import com.jobverse.repository.ResumeRepository;
import com.jobverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    
    /**
     * Ứng tuyển vào job
     */
    @Transactional
    public ApplicationResponse apply(Long candidateId, ApplicationRequest request) {
        // Kiểm tra job tồn tại và đang active
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        if (job.getStatus() != Job.Status.ACTIVE) {
            throw new BadRequestException("This job is no longer accepting applications");
        }
        
        // Kiểm tra user
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (candidate.getRole() != User.Role.CANDIDATE) {
            throw new BadRequestException("Only candidates can apply for jobs");
        }
        
        // Kiểm tra đã ứng tuyển chưa
        if (applicationRepository.existsByJobIdAndCandidateId(request.getJobId(), candidateId)) {
            throw new BadRequestException("You have already applied for this job");
        }
        
        // Tạo application
        Application application = new Application();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setCoverLetter(request.getCoverLetter());
        application.setExpectedSalary(request.getExpectedSalary());
        application.setStatus(Application.Status.PENDING);
        
        // Attach resume nếu có
        if (request.getResumeId() != null) {
            resumeRepository.findById(request.getResumeId())
                    .ifPresent(application::setResume);
        }
        
        Application saved = applicationRepository.save(application);
        
        // Tăng application count của job
        job.setApplicationCount(job.getApplicationCount() + 1);
        jobRepository.save(job);
        
        return ApplicationResponse.fromEntity(saved);
    }
    
    /**
     * Lấy danh sách đơn ứng tuyển của candidate
     */
    public List<ApplicationResponse> getMyApplications(Long candidateId) {
        List<Application> applications = applicationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId);
        return applications.stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách ứng viên cho 1 job (employer)
     */
    public Page<ApplicationResponse> getApplicationsByJob(Long jobId, Long employerId, Pageable pageable) {
        // Verify employer owns this job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        if (!job.getCompany().getOwner().getId().equals(employerId)) {
            throw new UnauthorizedException("You don't have permission to view these applications");
        }
        
        Page<Application> applications = applicationRepository.findByJobIdOrderByCreatedAtDesc(jobId, pageable);
        return applications.map(ApplicationResponse::fromEntity);
    }
    
    /**
     * Lấy tất cả applications cho employer (tất cả jobs của họ)
     */
    public Page<ApplicationResponse> getAllApplicationsForEmployer(Long employerId, Application.Status status, Pageable pageable) {
        Page<Application> applications;
        
        if (status != null) {
            applications = applicationRepository.findByEmployerIdAndStatus(employerId, status, pageable);
        } else {
            applications = applicationRepository.findByEmployerId(employerId, pageable);
        }
        
        return applications.map(ApplicationResponse::fromEntity);
    }
    
    /**
     * Cập nhật trạng thái đơn ứng tuyển (employer)
     */
    @Transactional
    public ApplicationResponse updateStatus(Long applicationId, Long employerId, UpdateApplicationStatusRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        
        // Verify employer owns this job
        if (!application.getJob().getCompany().getOwner().getId().equals(employerId)) {
            throw new UnauthorizedException("You don't have permission to update this application");
        }
        
        application.setStatus(request.getStatus());
        
        if (request.getEmployerNote() != null) {
            application.setEmployerNote(request.getEmployerNote());
        }
        
        if (request.getInterviewDate() != null) {
            application.setInterviewDate(request.getInterviewDate());
        }
        
        Application updated = applicationRepository.save(application);
        
        // TODO: Send notification/email to candidate
        
        return ApplicationResponse.fromEntity(updated);
    }
    
    /**
     * Lấy chi tiết 1 application
     */
    public ApplicationResponse getApplicationById(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        
        // Verify user is candidate or employer of this application
        boolean isCandidate = application.getCandidate().getId().equals(userId);
        boolean isEmployer = application.getJob().getCompany().getOwner().getId().equals(userId);
        
        if (!isCandidate && !isEmployer) {
            throw new UnauthorizedException("You don't have permission to view this application");
        }
        
        return ApplicationResponse.fromEntity(application);
    }
    
    /**
     * Hủy đơn ứng tuyển (candidate)
     */
    @Transactional
    public void withdrawApplication(Long applicationId, Long candidateId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        
        if (!application.getCandidate().getId().equals(candidateId)) {
            throw new UnauthorizedException("You don't have permission to withdraw this application");
        }
        
        if (application.getStatus() != Application.Status.PENDING && 
            application.getStatus() != Application.Status.REVIEWING) {
            throw new BadRequestException("Cannot withdraw application at this stage");
        }
        
        application.setStatus(Application.Status.WITHDRAWN);
        applicationRepository.save(application);
        
        // Giảm application count của job
        Job job = application.getJob();
        job.setApplicationCount(Math.max(0, job.getApplicationCount() - 1));
        jobRepository.save(job);
    }
    
    /**
     * Kiểm tra user đã apply job này chưa
     */
    public boolean hasApplied(Long jobId, Long candidateId) {
        return applicationRepository.existsByJobIdAndCandidateId(jobId, candidateId);
    }
    
    /**
     * Đếm số applications theo status cho employer
     */
    public long countByStatusForEmployer(Long employerId, Application.Status status) {
        return applicationRepository.countByEmployerIdAndStatus(employerId, status);
    }
}
