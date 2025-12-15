// File: src/main/java/com/jobverse/controller/ApplicationController.java

package com.jobverse.controller;

import com.jobverse.dto.request.ApplicationRequest;
import com.jobverse.dto.request.UpdateApplicationStatusRequest;
import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.ApplicationResponse;
import com.jobverse.entity.Application;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.ApplicationService;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Job Application APIs")
public class ApplicationController {
    
    private final ApplicationService applicationService;
    
    // ==================== CANDIDATE APIs ====================
    
    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Apply for a job")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ApplicationRequest request
    ) {
        ApplicationResponse response = applicationService.apply(currentUser.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", response));
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get my applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(
            @CurrentUser UserPrincipal currentUser
    ) {
        List<ApplicationResponse> applications = applicationService.getMyApplications(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", applications));
    }
    
    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Withdraw an application")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        applicationService.withdrawApplication(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn", null));
    }
    
    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Check if already applied")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkApplied(
            @PathVariable Long jobId,
            @CurrentUser UserPrincipal currentUser
    ) {
        boolean hasApplied = applicationService.hasApplied(jobId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Check completed", Map.of("hasApplied", hasApplied)));
    }
    
    // ==================== EMPLOYER APIs ====================
    
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Get applications for a job")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getApplicationsByJob(
            @PathVariable Long jobId,
            @CurrentUser UserPrincipal currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<ApplicationResponse> applications = applicationService.getApplicationsByJob(jobId, currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", applications));
    }
    
    @GetMapping("/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Get all applications for employer")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getAllApplicationsForEmployer(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) Application.Status status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<ApplicationResponse> applications = applicationService.getAllApplicationsForEmployer(currentUser.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", applications));
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Update application status")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        ApplicationResponse response = applicationService.updateStatus(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Status updated", response));
    }
    
    @GetMapping("/employer/stats")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Get application statistics")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats(
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
    
    // ==================== COMMON APIs ====================
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get application details")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationById(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        ApplicationResponse response = applicationService.getApplicationById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Application retrieved", response));
    }
}
