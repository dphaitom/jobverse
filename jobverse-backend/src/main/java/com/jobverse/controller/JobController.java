package com.jobverse.controller;

import com.jobverse.dto.request.ApplicationRequest;
import com.jobverse.dto.request.JobRequest;
import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.JobResponse;
import com.jobverse.entity.Job;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Job management APIs")
public class JobController {
    
    private final JobService jobService;
    
    @GetMapping
    @Operation(summary = "Get all active jobs with pagination and filters")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getAllJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Job.JobType jobType,
            @RequestParam(required = false) Job.ExperienceLevel experienceLevel,
            @RequestParam(required = false) BigDecimal salaryMin,
            @RequestParam(required = false) BigDecimal salaryMax,
            @RequestParam(required = false) Boolean isRemote,
            @RequestParam(required = false) List<Long> skillIds,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @CurrentUser UserPrincipal currentUser
    ) {
        Page<JobResponse> jobs = jobService.searchJobs(
                keyword, location, categoryId, jobType, experienceLevel,
                salaryMin, salaryMax, isRemote, skillIds, pageable,
                currentUser != null ? currentUser.getId() : null
        );
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get job details by ID")
    public ResponseEntity<ApiResponse<JobResponse>> getJobById(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        JobResponse job = jobService.getJobById(
                id,
                currentUser != null ? currentUser.getId() : null
        );
        return ResponseEntity.ok(ApiResponse.success(job));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get job details by slug")
    public ResponseEntity<ApiResponse<JobResponse>> getJobBySlug(
            @PathVariable String slug,
            @CurrentUser UserPrincipal currentUser
    ) {
        JobResponse job = jobService.getJobBySlug(
                slug,
                currentUser != null ? currentUser.getId() : null
        );
        return ResponseEntity.ok(ApiResponse.success(job));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Full-text search jobs")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> searchJobs(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable,
            @CurrentUser UserPrincipal currentUser
    ) {
        Page<JobResponse> jobs = jobService.fullTextSearch(
                q, pageable,
                currentUser != null ? currentUser.getId() : null
        );
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }
    
    @GetMapping("/recommended")
    @Operation(summary = "Get AI-recommended jobs for current user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getRecommendedJobs(
            @CurrentUser UserPrincipal currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<JobResponse> jobs = jobService.getRecommendedJobs(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }
    
    @GetMapping("/trending")
    @Operation(summary = "Get trending jobs")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getTrendingJobs() {
        List<JobResponse> jobs = jobService.getTrendingJobs();
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }
    
    @GetMapping("/featured")
    @Operation(summary = "Get featured jobs")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getFeaturedJobs() {
        List<JobResponse> jobs = jobService.getFeaturedJobs();
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }
    
    @GetMapping("/{id}/similar")
    @Operation(summary = "Get similar jobs")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getSimilarJobs(
            @PathVariable Long id
    ) {
        List<JobResponse> jobs = jobService.getSimilarJobs(id);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }
    
    @PostMapping
    @Operation(summary = "Create a new job posting")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @Valid @RequestBody JobRequest request,
            @CurrentUser UserPrincipal currentUser
    ) {
        JobResponse job = jobService.createJob(request, currentUser.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job created successfully", job));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update job posting")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request,
            @CurrentUser UserPrincipal currentUser
    ) {
        JobResponse job = jobService.updateJob(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job updated successfully", job));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete job posting")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        jobService.deleteJob(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job deleted successfully", null));
    }
    
    @PostMapping("/{id}/apply")
    @Operation(summary = "Apply for a job")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> applyForJob(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationRequest request,
            @CurrentUser UserPrincipal currentUser
    ) {
        request.setJobId(id);
        jobService.applyForJob(request, currentUser.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", null));
    }
    
    @PostMapping("/{id}/save")
    @Operation(summary = "Save job to favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> saveJob(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        jobService.saveJob(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job saved successfully", null));
    }
    
    @DeleteMapping("/{id}/save")
    @Operation(summary = "Remove job from favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        jobService.unsaveJob(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job removed from saved", null));
    }
    
    @GetMapping("/saved")
    @Operation(summary = "Get saved jobs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getSavedJobs(
            @CurrentUser UserPrincipal currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<JobResponse> jobs = jobService.getSavedJobs(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }
}
