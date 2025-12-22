package com.jobverse.controller;

import com.jobverse.dto.request.ApplicationRequest;
import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.ApplicationResponse;
import com.jobverse.entity.Application;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Job application management APIs")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Apply for job", description = "Submit a job application")
    public ResponseEntity<ApiResponse<Application>> createApplication(
            @Valid @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("User {} applying for job {}", userPrincipal.getId(), request.getJobId());

        Application application = applicationService.createApplication(request, userPrincipal.getId());

        return ResponseEntity.ok(ApiResponse.success("Application submitted successfully", application));
    }

    @PostMapping("/quick-apply/{jobId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Quick apply", description = "One-click apply with default resume")
    public ResponseEntity<ApiResponse<ApplicationResponse>> quickApply(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("User {} quick applying for job {}", userPrincipal.getId(), jobId);

        Application application = applicationService.quickApply(jobId, userPrincipal.getId());
        ApplicationResponse response = ApplicationResponse.fromEntity(application);

        return ResponseEntity.ok(ApiResponse.success("Quick application submitted successfully", response));
    }

    @GetMapping("/my-applications")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my applications", description = "Get all applications of current user")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable
    ) {
        log.info("Fetching applications for user {}", userPrincipal.getId());

        Page<Application> applications = applicationService.getUserApplications(userPrincipal.getId(), pageable);
        Page<ApplicationResponse> response = applications.map(ApplicationResponse::fromEntity);

        return ResponseEntity.ok(ApiResponse.success("Applications retrieved successfully", response));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get job applications", description = "Get all applications for a job (employer only)")
    public ResponseEntity<ApiResponse<Page<Application>>> getJobApplications(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable
    ) {
        log.info("Fetching applications for job {} by user {}", jobId, userPrincipal.getId());

        Page<Application> applications = applicationService.getJobApplications(jobId, pageable);

        return ResponseEntity.ok(ApiResponse.success("Applications retrieved successfully", applications));
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update application status", description = "Update application status (employer only)")
    public ResponseEntity<ApiResponse<Application>> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam Application.ApplicationStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("User {} updating application {} status to {}", userPrincipal.getId(), applicationId, status);

        Application application = applicationService.updateApplicationStatus(applicationId, status, userPrincipal.getId());

        return ResponseEntity.ok(ApiResponse.success("Application status updated successfully", application));
    }

    @DeleteMapping("/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Withdraw application", description = "Withdraw an application")
    public ResponseEntity<ApiResponse<String>> withdrawApplication(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("User {} withdrawing application {}", userPrincipal.getId(), applicationId);

        applicationService.withdrawApplication(applicationId, userPrincipal.getId());

        return ResponseEntity.ok(ApiResponse.success("Application withdrawn successfully", null));
    }
}
