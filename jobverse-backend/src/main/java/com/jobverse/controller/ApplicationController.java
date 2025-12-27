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
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Job Application APIs")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Apply for a job")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ApplicationRequest request
    ) {
        log.info("User {} applying for job {}", currentUser.getId(), request.getJobId());
        Application application = applicationService.createApplication(request, currentUser.getId());
        ApplicationResponse response = ApplicationResponse.fromEntity(application);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", response));
    }

    @PostMapping("/quick-apply")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Quick apply for a job")
    public ResponseEntity<ApiResponse<ApplicationResponse>> quickApply(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Long> request
    ) {
        Long jobId = request.get("jobId");
        if (jobId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("BAD_REQUEST", "Job ID is required"));
        }

        log.info("User {} quick applying for job {}", currentUser.getId(), jobId);
        Application application = applicationService.quickApply(jobId, currentUser.getId());
        ApplicationResponse response = ApplicationResponse.fromEntity(application);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Quick application submitted successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        log.info("User {} fetching their applications", currentUser.getId());
        Page<Application> applications = applicationService.getUserApplications(currentUser.getId(), pageable);
        List<ApplicationResponse> responses = applications.getContent().stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", responses));
    }

    @GetMapping("/check/{jobId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if already applied")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkApplied(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        boolean hasApplied = applicationService.hasApplied(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Check completed", Map.of("hasApplied", hasApplied)));
    }

    @PostMapping("/{applicationId}/withdraw")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Withdraw application")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("User {} withdrawing application {}", currentUser.getId(), applicationId);
        applicationService.withdrawApplication(applicationId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn successfully", null));
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    @Operation(summary = "Update application status (Employer only)")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String statusStr = request.get("status");
        Application.ApplicationStatus status = Application.ApplicationStatus.valueOf(statusStr);

        log.info("Employer {} updating application {} to status {}", currentUser.getId(), applicationId, status);
        Application application = applicationService.updateApplicationStatus(applicationId, status, currentUser.getId());
        ApplicationResponse response = ApplicationResponse.fromEntity(application);
        return ResponseEntity.ok(ApiResponse.success("Status updated", response));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    @Operation(summary = "Get applications for a job (Employer only)")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getJobApplications(
            @PathVariable Long jobId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("Employer {} fetching applications for job {}", currentUser.getId(), jobId);
        Page<Application> applications = applicationService.getJobApplications(jobId, currentUser.getId(), pageable);
        List<ApplicationResponse> responses = applications.getContent().stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", responses));
    }
}