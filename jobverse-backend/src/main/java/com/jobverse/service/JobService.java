package com.jobverse.service;

import com.jobverse.dto.request.ApplicationRequest;
import com.jobverse.dto.request.JobRequest;
import com.jobverse.dto.response.JobResponse;
import com.jobverse.entity.*;
import com.jobverse.exception.BadRequestException;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.exception.UnauthorizedException;
import com.jobverse.repository.*;
import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {
    
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;
    private final SkillRepository skillRepository;
    private final AIMatchingService aiMatchingService;
    private final NotificationService notificationService;
    
    private final Slugify slugify = Slugify.builder().build();

    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(
            String keyword, String location, Long categoryId,
            Job.JobType jobType, Job.ExperienceLevel experienceLevel,
            BigDecimal salaryMin, BigDecimal salaryMax, Boolean isRemote,
            List<Long> skillIds, Pageable pageable, Long userId
    ) {
        Specification<Job> spec = Specification.where(JobSpecification.hasStatus(Job.JobStatus.ACTIVE));
        
        if (keyword != null && !keyword.isBlank()) {
            spec = spec.and(JobSpecification.containsKeyword(keyword));
        }
        if (location != null && !location.isBlank()) {
            spec = spec.and(JobSpecification.hasLocation(location));
        }
        if (categoryId != null) {
            spec = spec.and(JobSpecification.hasCategory(categoryId));
        }
        if (jobType != null) {
            spec = spec.and(JobSpecification.hasJobType(jobType));
        }
        if (experienceLevel != null) {
            spec = spec.and(JobSpecification.hasExperienceLevel(experienceLevel));
        }
        if (salaryMin != null) {
            spec = spec.and(JobSpecification.hasSalaryMin(salaryMin));
        }
        if (salaryMax != null) {
            spec = spec.and(JobSpecification.hasSalaryMax(salaryMax));
        }
        if (isRemote != null && isRemote) {
            spec = spec.and(JobSpecification.isRemote());
        }
        
        Page<Job> jobs = jobRepository.findAll(spec, pageable);
        
        return jobs.map(job -> mapToJobResponse(job, userId));
    }
    
    @Transactional(readOnly = true)
    public Page<JobResponse> fullTextSearch(String query, Pageable pageable, Long userId) {
        // In production, this would use Elasticsearch
        Specification<Job> spec = Specification.where(JobSpecification.hasStatus(Job.JobStatus.ACTIVE))
                .and(JobSpecification.containsKeyword(query));

        Page<Job> jobs = jobRepository.findAll(spec, pageable);
        return jobs.map(job -> mapToJobResponse(job, userId));
    }
    
    @Transactional
    public JobResponse getJobById(Long id, Long userId) {
        Job job = jobRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        
        // Increment view count
        jobRepository.incrementViewCount(id);
        
        JobResponse response = mapToJobResponse(job, userId);
        
        // Get AI match score if user is logged in
        if (userId != null) {
            JobResponse.MatchAnalysis matchAnalysis = aiMatchingService.calculateMatchScore(userId, job);
            response.setMatchScore(matchAnalysis != null ? 
                    (matchAnalysis.getSkillMatch() + matchAnalysis.getExperienceMatch() + 
                     matchAnalysis.getSalaryMatch() + matchAnalysis.getLocationMatch()) / 4 : null);
            response.setMatchAnalysis(matchAnalysis);
        }
        
        return response;
    }
    
    public JobResponse getJobBySlug(String slug, Long userId) {
        Job job = jobRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with slug: " + slug));
        
        return getJobById(job.getId(), userId);
    }
    
    public Page<JobResponse> getRecommendedJobs(Long userId, Pageable pageable) {
        User user = userRepository.findByIdWithProfile(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Get user skills
        List<Long> skillIds = user.getSkills().stream()
                .map(us -> us.getSkill().getId())
                .collect(Collectors.toList());
        
        if (skillIds.isEmpty()) {
            // If no skills, return recent active jobs
            return jobRepository.findByStatus(Job.JobStatus.ACTIVE, pageable)
                    .map(job -> mapToJobResponse(job, userId));
        }
        
        // Find jobs matching user skills
        Page<Job> jobs = jobRepository.findBySkillIds(skillIds, pageable);
        
        return jobs.map(job -> {
            JobResponse response = mapToJobResponse(job, userId);
            // Calculate match score
            JobResponse.MatchAnalysis matchAnalysis = aiMatchingService.calculateMatchScore(userId, job);
            response.setMatchScore(matchAnalysis != null ?
                    (matchAnalysis.getSkillMatch() + matchAnalysis.getExperienceMatch()) / 2 : null);
            response.setMatchAnalysis(matchAnalysis);
            return response;
        });
    }
    
    public List<JobResponse> getTrendingJobs() {
        List<Job> jobs = jobRepository.findUrgentJobs(PageRequest.of(0, 10));
        return jobs.stream()
                .map(job -> mapToJobResponse(job, null))
                .collect(Collectors.toList());
    }
    
    public List<JobResponse> getFeaturedJobs() {
        List<Job> jobs = jobRepository.findFeaturedJobs(PageRequest.of(0, 10));
        return jobs.stream()
                .map(job -> mapToJobResponse(job, null))
                .collect(Collectors.toList());
    }
    
    public List<JobResponse> getSimilarJobs(Long jobId) {
        Job job = jobRepository.findByIdWithDetails(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        List<Long> skillIds = job.getSkills().stream()
                .map(js -> js.getSkill().getId())
                .collect(Collectors.toList());
        
        Page<Job> similarJobs = jobRepository.findBySkillIds(skillIds, PageRequest.of(0, 5));
        
        return similarJobs.stream()
                .filter(j -> !j.getId().equals(jobId))
                .map(j -> mapToJobResponse(j, null))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public JobResponse createJob(JobRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Company company;
        
        // If companyId is provided, use it (for backward compatibility)
        // Otherwise, auto-derive from employer's company (1:1 relationship)
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
            
            // Verify user owns the company or is admin
            if (!company.getOwner().getId().equals(userId) && user.getRole() != User.Role.ADMIN) {
                throw new UnauthorizedException("You don't have permission to post jobs for this company");
            }
        } else {
            // Auto-derive company from employer (new behavior)
            company = companyRepository.findByOwnerId(userId)
                    .orElseThrow(() -> new BadRequestException(
                        "No company found for your account. Please create a company first or contact support."
                    ));
        }
        
        // Generate unique slug
        String baseSlug = slugify.slugify(request.getTitle());
        String slug = generateUniqueSlug(baseSlug);
        
        Job job = Job.builder()
                .company(company)
                .postedBy(user)
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .responsibilities(request.getResponsibilities())
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .salaryNegotiable(request.getSalaryNegotiable())
                .currency(request.getCurrency())
                .location(request.getLocation())
                .isRemote(request.getIsRemote())
                .remoteType(request.getRemoteType())
                .positionsCount(request.getPositionsCount())
                .deadline(request.getDeadline())
                .status(Job.JobStatus.ACTIVE)
                .isFeatured(request.getIsFeatured() != null && request.getIsFeatured())
                .isUrgent(request.getIsUrgent() != null && request.getIsUrgent())
                .videoIntroUrl(request.getVideoIntroUrl())
                .build();
        
        job = jobRepository.save(job);
        
        log.info("Job created: {} by user: {}", job.getTitle(), user.getEmail());
        
        return mapToJobResponse(job, userId);
    }
    
    @Transactional
    public JobResponse updateJob(Long id, JobRequest request, Long userId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        // Verify permission
        if (!job.getPostedBy().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to update this job");
        }
        
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setResponsibilities(request.getResponsibilities());
        job.setJobType(request.getJobType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setLocation(request.getLocation());
        job.setIsRemote(request.getIsRemote());
        job.setDeadline(request.getDeadline());
        
        job = jobRepository.save(job);
        
        return mapToJobResponse(job, userId);
    }
    
    @Transactional
    public void deleteJob(Long id, Long userId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        if (!job.getPostedBy().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to delete this job");
        }
        
        job.setStatus(Job.JobStatus.CLOSED);
        jobRepository.save(job);
        
        log.info("Job closed: {}", job.getTitle());
    }
    
    @Transactional
    public void applyForJob(ApplicationRequest request, Long userId) {
        // Check if already applied
        if (applicationRepository.existsByJobIdAndUserId(request.getJobId(), userId)) {
            throw new BadRequestException("You have already applied for this job");
        }
        
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        if (job.getStatus() != Job.JobStatus.ACTIVE) {
            throw new BadRequestException("This job is no longer accepting applications");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Application application = Application.builder()
                .job(job)
                .user(user)
                .coverLetter(request.getCoverLetter())
                .expectedSalary(request.getExpectedSalary())
                .status(Application.ApplicationStatus.PENDING)
                .build();
        
        // Calculate AI match score
        JobResponse.MatchAnalysis matchAnalysis = aiMatchingService.calculateMatchScore(userId, job);
        if (matchAnalysis != null) {
            application.setAiMatchScore(
                    (matchAnalysis.getSkillMatch() + matchAnalysis.getExperienceMatch()) / 2
            );
        }
        
        applicationRepository.save(application);
        jobRepository.incrementApplicationCount(job.getId());
        
        // Send notifications
        notificationService.sendApplicationNotification(application);
        
        log.info("Application submitted: Job {} by User {}", job.getTitle(), user.getEmail());
    }
    
    @Transactional
    public void saveJob(Long jobId, Long userId) {
        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            return; // Already saved
        }
        
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        SavedJob savedJob = SavedJob.builder()
                .user(user)
                .job(job)
                .build();
        
        savedJobRepository.save(savedJob);
    }
    
    @Transactional
    public void unsaveJob(Long jobId, Long userId) {
        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
    }
    
    public Page<JobResponse> getSavedJobs(Long userId, Pageable pageable) {
        Page<SavedJob> savedJobs = savedJobRepository.findByUserIdOrderBySavedAtDesc(userId, pageable);
        return savedJobs.map(sj -> mapToJobResponse(sj.getJob(), userId));
    }
    
    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (jobRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }
    
    private JobResponse mapToJobResponse(Job job, Long userId) {
        JobResponse.CompanyInfo companyInfo = JobResponse.CompanyInfo.builder()
                .id(job.getCompany().getId())
                .name(job.getCompany().getName())
                .slug(job.getCompany().getSlug())
                .logoUrl(job.getCompany().getLogoUrl())
                .industry(job.getCompany().getIndustry())
                .rating(job.getCompany().getRatingAvg())
                .reviewCount(job.getCompany().getReviewCount())
                .isVerified(job.getCompany().getVerificationStatus() == Company.VerificationStatus.VERIFIED)
                .build();
        
        List<JobResponse.SkillInfo> skills = job.getSkills().stream()
                .map(js -> JobResponse.SkillInfo.builder()
                        .id(js.getSkill().getId())
                        .name(js.getSkill().getName())
                        .proficiency(js.getProficiency() != null ? js.getProficiency().name() : null)
                        .isRequired(js.getIsRequired())
                        .build())
                .collect(Collectors.toList());
        
        List<JobResponse.BenefitInfo> benefits = job.getBenefits().stream()
                .map(jb -> JobResponse.BenefitInfo.builder()
                        .name(jb.getBenefitName())
                        .description(jb.getDescription())
                        .icon(jb.getIcon())
                        .build())
                .collect(Collectors.toList());
        
        String salaryDisplay = formatSalary(job.getSalaryMin(), job.getSalaryMax(), job.getCurrency());
        String postedTimeAgo = formatTimeAgo(job.getCreatedAt());
        
        JobResponse response = JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .slug(job.getSlug())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .responsibilities(job.getResponsibilities())
                .company(companyInfo)
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryNegotiable(job.getSalaryNegotiable())
                .currency(job.getCurrency())
                .salaryDisplay(salaryDisplay)
                .location(job.getLocation())
                .isRemote(job.getIsRemote())
                .remoteType(job.getRemoteType())
                .positionsCount(job.getPositionsCount())
                .deadline(job.getDeadline())
                .status(job.getStatus())
                .isFeatured(job.getIsFeatured())
                .isUrgent(job.getIsUrgent())
                .videoIntroUrl(job.getVideoIntroUrl())
                .viewCount(job.getViewCount())
                .applicationCount(job.getApplicationCount())
                .skills(skills)
                .benefits(benefits)
                .createdAt(job.getCreatedAt())
                .postedTimeAgo(postedTimeAgo)
                .build();
        
        // Check user interactions
        if (userId != null) {
            response.setIsSaved(savedJobRepository.existsByUserIdAndJobId(userId, job.getId()));
            response.setHasApplied(applicationRepository.existsByJobIdAndUserId(job.getId(), userId));
        }
        
        return response;
    }
    
    private String formatSalary(BigDecimal min, BigDecimal max, String currency) {
        if (min == null && max == null) return "Thương lượng";
        if (min != null && max != null) {
            return String.format("%s - %s %s", 
                    formatNumber(min), formatNumber(max), currency);
        }
        if (min != null) return "Từ " + formatNumber(min) + " " + currency;
        return "Đến " + formatNumber(max) + " " + currency;
    }
    
    private String formatNumber(BigDecimal number) {
        if (number.compareTo(BigDecimal.valueOf(1000000)) >= 0) {
            return number.divide(BigDecimal.valueOf(1000000)).stripTrailingZeros().toPlainString() + " triệu";
        }
        return number.stripTrailingZeros().toPlainString();
    }
    
    private String formatTimeAgo(LocalDateTime dateTime) {
        long minutes = ChronoUnit.MINUTES.between(dateTime, LocalDateTime.now());
        if (minutes < 60) return minutes + " phút trước";
        long hours = minutes / 60;
        if (hours < 24) return hours + " giờ trước";
        long days = hours / 24;
        if (days < 30) return days + " ngày trước";
        long months = days / 30;
        return months + " tháng trước";
    }
    
    @Transactional(readOnly = true)
    public Page<JobResponse> getJobsByEmployer(Long userId, Pageable pageable) {
        log.info("Getting jobs posted by user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if user is employer
        if (user.getRole() != User.Role.EMPLOYER && user.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Only employers can view their posted jobs");
        }
        
        Page<Job> jobs = jobRepository.findByPostedById(userId, pageable);
        return jobs.map(job -> mapToJobResponse(job, userId));
    }
    
    @Transactional
    public JobResponse changeJobStatus(Long jobId, Job.JobStatus status, Long userId) {
        log.info("Changing job {} status to {} by user {}", jobId, status, userId);
        
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        // Check authorization
        if (!job.getPostedBy().getId().equals(userId)) {
            User user = userRepository.findById(userId).orElseThrow();
            if (user.getRole() != User.Role.ADMIN) {
                throw new UnauthorizedException("You can only change status of your own jobs");
            }
        }
        
        job.setStatus(status);
        job = jobRepository.save(job);
        
        log.info("Job status updated successfully");
        return mapToJobResponse(job, userId);
    }
}
