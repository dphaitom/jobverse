// File: src/main/java/com/jobverse/controller/EmployerController.java

package com.jobverse.controller;

import com.jobverse.dto.request.CreateJobRequest;
import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.ApplicationResponse;
import com.jobverse.dto.response.JobResponse;
import com.jobverse.entity.Application;
import com.jobverse.entity.Job;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.ApplicationService;
import com.jobverse.service.JobManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/employer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYER')")
@Tag(name = "Employer", description = "Employer Dashboard APIs")
public class EmployerController {
    
    private final JobManagementService jobManagementService;
    private final ApplicationService applicationService;
    
    // ==================== JOB MANAGEMENT ====================
    
    @PostMapping("/jobs")
    @Operation(summary = "Create a new job posting")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateJobRequest request
    ) {
        JobResponse response = jobManagementService.createJob(currentUser.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job created successfully", response));
    }
    
    @PutMapping("/jobs/{id}")
    @Operation(summary = "Update a job posting")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateJobRequest request
    ) {
        JobResponse response = jobManagementService.updateJob(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Job updated successfully", response));
    }
    
    @PutMapping("/jobs/{id}/status")
    @Operation(summary = "Update job status")
    public ResponseEntity<ApiResponse<JobResponse>> updateJobStatus(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, String> request
    ) {
        Job.Status status = Job.Status.valueOf(request.get("status"));
        JobResponse response = jobManagementService.updateJobStatus(id, currentUser.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Job status updated", response));
    }
    
    @DeleteMapping("/jobs/{id}")
    @Operation(summary = "Delete a job posting")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        jobManagementService.deleteJob(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job deleted", null));
    }
    
    @GetMapping("/jobs")
    @Operation(summary = "Get my job postings")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getMyJobs(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) Job.Status status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<JobResponse> jobs = jobManagementService.getMyJobs(currentUser.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Jobs retrieved", jobs));
    }
    
    @GetMapping("/jobs/stats")
    @Operation(summary = "Get job statistics")
    public ResponseEntity<ApiResponse<JobManagementService.JobStats>> getJobStats(
            @CurrentUser UserPrincipal currentUser
    ) {
        JobManagementService.JobStats stats = jobManagementService.getJobStats(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", stats));
    }
    
    // ==================== APPLICATION MANAGEMENT ====================
    
    @GetMapping("/applications")
    @Operation(summary = "Get all applications for my jobs")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getAllApplications(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) Application.Status status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<ApplicationResponse> applications = applicationService.getAllApplicationsForEmployer(currentUser.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", applications));
    }
    
    @GetMapping("/applications/stats")
    @Operation(summary = "Get application statistics")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getApplicationStats(
            @CurrentUser UserPrincipal currentUser
    ) {
        Map<String, Long> stats = Map.of(
            "pending", applicationService.countByStatusForEmployer(currentUser.getId(), Application.Status.PENDING),
            "reviewing", applicationService.countByStatusForEmployer(currentUser.getId(), Application.Status.REVIEWING),
            "interview", applicationService.countByStatusForEmployer(currentUser.getId(), Application.Status.INTERVIEW),
            "accepted", applicationService.countByStatusForEmployer(currentUser.getId(), Application.Status.ACCEPTED),
            "rejected", applicationService.countByStatusForEmployer(currentUser.getId(), Application.Status.REJECTED)
        );
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", stats));
    }
    
    // ==================== DASHBOARD ====================
    
    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @CurrentUser UserPrincipal currentUser
    ) {
        JobManagementService.JobStats jobStats = jobManagementService.getJobStats(currentUser.getId());
        
        Map<String, Object> dashboard = Map.of(
            "jobs", Map.of(
                "total", jobStats.getTotalJobs(),
                "active", jobStats.getActiveJobs(),
                "paused", jobStats.getPausedJobs(),
                "closed", jobStats.getClosedJobs()
            ),
            "applications", Map.of(
                "pending", applicationService.countByStatusForEmployer(currentUser.getId(), Application.Status.PENDING),
                "reviewing", applicationService.countByStatusForEmployer(currentUser.getId(), Application.Status.REVIEWING),
                "interview", applicationService.countByStatusForEmployer(currentUser.getId(), Application.Status.INTERVIEW)
            ),
            "metrics", Map.of(
                "totalViews", jobStats.getTotalViews(),
                "totalApplications", jobStats.getTotalApplications()
            )
        );
        
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", dashboard));
    }
}
