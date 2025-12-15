// File: src/main/java/com/jobverse/service/JobManagementService.java

package com.jobverse.service;

import com.jobverse.dto.request.CreateJobRequest;
import com.jobverse.dto.response.JobResponse;
import com.jobverse.entity.*;
import com.jobverse.exception.BadRequestException;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.exception.UnauthorizedException;
import com.jobverse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class JobManagementService {
    
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final CategoryRepository categoryRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    
    /**
     * Tạo job mới
     */
    @Transactional
    public JobResponse createJob(Long employerId, CreateJobRequest request) {
        // Lấy company của employer
        Company company = companyRepository.findByOwnerId(employerId)
                .orElseThrow(() -> new BadRequestException("You need to create a company first"));
        
        // Tạo slug từ title
        String slug = generateSlug(request.getTitle());
        
        // Ensure unique slug
        String uniqueSlug = slug;
        int counter = 1;
        while (jobRepository.existsBySlug(uniqueSlug)) {
            uniqueSlug = slug + "-" + counter++;
        }
        
        Job job = new Job();
        job.setCompany(company);
        job.setTitle(request.getTitle());
        job.setSlug(uniqueSlug);
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setResponsibilities(request.getResponsibilities());
        job.setBenefits(request.getBenefits());
        job.setJobType(request.getJobType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setLocation(request.getLocation());
        job.setRemote(request.isRemote());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setSalaryCurrency(request.getSalaryCurrency());
        job.setSalaryNegotiable(request.isSalaryNegotiable());
        job.setPositionsCount(request.getPositionsCount());
        job.setDeadline(request.getDeadline());
        job.setUrgent(request.isUrgent());
        job.setFeatured(request.isFeatured());
        job.setStatus(Job.Status.ACTIVE);
        job.setViewCount(0);
        job.setApplicationCount(0);
        
        // Set category
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .ifPresent(job::setCategory);
        }
        
        // Set skills
        Set<Skill> skills = new HashSet<>();
        if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
            skills.addAll(skillRepository.findAllById(request.getSkillIds()));
        }
        
        // Create new skills if provided
        if (request.getNewSkills() != null) {
            for (String skillName : request.getNewSkills()) {
                if (StringUtils.hasText(skillName)) {
                    String skillSlug = generateSlug(skillName);
                    Skill skill = skillRepository.findBySlug(skillSlug)
                            .orElseGet(() -> {
                                Skill newSkill = new Skill();
                                newSkill.setName(skillName);
                                newSkill.setSlug(skillSlug);
                                return skillRepository.save(newSkill);
                            });
                    skills.add(skill);
                }
            }
        }
        job.setSkills(skills);
        
        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved);
    }
    
    /**
     * Cập nhật job
     */
    @Transactional
    public JobResponse updateJob(Long jobId, Long employerId, CreateJobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        // Verify ownership
        if (!job.getCompany().getOwner().getId().equals(employerId)) {
            throw new UnauthorizedException("You don't have permission to edit this job");
        }
        
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setResponsibilities(request.getResponsibilities());
        job.setBenefits(request.getBenefits());
        job.setJobType(request.getJobType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setLocation(request.getLocation());
        job.setRemote(request.isRemote());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setSalaryCurrency(request.getSalaryCurrency());
        job.setSalaryNegotiable(request.isSalaryNegotiable());
        job.setPositionsCount(request.getPositionsCount());
        job.setDeadline(request.getDeadline());
        job.setUrgent(request.isUrgent());
        job.setFeatured(request.isFeatured());
        
        // Update category
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .ifPresent(job::setCategory);
        }
        
        // Update skills
        Set<Skill> skills = new HashSet<>();
        if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
            skills.addAll(skillRepository.findAllById(request.getSkillIds()));
        }
        job.setSkills(skills);
        
        Job updated = jobRepository.save(job);
        return JobResponse.fromEntity(updated);
    }
    
    /**
     * Đổi trạng thái job
     */
    @Transactional
    public JobResponse updateJobStatus(Long jobId, Long employerId, Job.Status status) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        if (!job.getCompany().getOwner().getId().equals(employerId)) {
            throw new UnauthorizedException("You don't have permission to modify this job");
        }
        
        job.setStatus(status);
        Job updated = jobRepository.save(job);
        return JobResponse.fromEntity(updated);
    }
    
    /**
     * Xóa job (soft delete - chuyển sang CLOSED)
     */
    @Transactional
    public void deleteJob(Long jobId, Long employerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        if (!job.getCompany().getOwner().getId().equals(employerId)) {
            throw new UnauthorizedException("You don't have permission to delete this job");
        }
        
        job.setStatus(Job.Status.CLOSED);
        jobRepository.save(job);
    }
    
    /**
     * Lấy danh sách jobs của employer
     */
    public Page<JobResponse> getMyJobs(Long employerId, Job.Status status, Pageable pageable) {
        Page<Job> jobs;
        
        if (status != null) {
            jobs = jobRepository.findByEmployerIdAndStatus(employerId, status, pageable);
        } else {
            jobs = jobRepository.findByEmployerId(employerId, pageable);
        }
        
        return jobs.map(JobResponse::fromEntity);
    }
    
    /**
     * Lấy thống kê jobs
     */
    public JobStats getJobStats(Long employerId) {
        return JobStats.builder()
                .totalJobs(jobRepository.countByEmployerId(employerId))
                .activeJobs(jobRepository.countByEmployerIdAndStatus(employerId, Job.Status.ACTIVE))
                .pausedJobs(jobRepository.countByEmployerIdAndStatus(employerId, Job.Status.PAUSED))
                .closedJobs(jobRepository.countByEmployerIdAndStatus(employerId, Job.Status.CLOSED))
                .totalViews(jobRepository.sumViewsByEmployerId(employerId))
                .totalApplications(jobRepository.sumApplicationsByEmployerId(employerId))
                .build();
    }
    
    /**
     * Generate slug from title
     */
    private String generateSlug(String input) {
        if (input == null) return "";
        
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("");
        
        slug = slug.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s-]+", "-")
                .replaceAll("^-|-$", "");
        
        return slug;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class JobStats {
        private long totalJobs;
        private long activeJobs;
        private long pausedJobs;
        private long closedJobs;
        private long totalViews;
        private long totalApplications;
    }
}
