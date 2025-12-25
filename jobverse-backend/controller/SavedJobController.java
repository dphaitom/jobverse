package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.JobResponse;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.SavedJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/saved-jobs")
@RequiredArgsConstructor
@Tag(name = "Saved Jobs", description = "Saved Jobs APIs")
public class SavedJobController {
    
    private final SavedJobService savedJobService;
    
    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get all saved jobs")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getSavedJobs(
            @CurrentUser UserPrincipal currentUser
    ) {
        List<JobResponse> savedJobs = savedJobService.getSavedJobs(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Saved jobs retrieved", savedJobs));
    }
    
    @PostMapping("/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Save a job")
    public ResponseEntity<ApiResponse<Void>> saveJob(
            @PathVariable Long jobId,
            @CurrentUser UserPrincipal currentUser
    ) {
        savedJobService.saveJob(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job saved successfully", null));
    }
    
    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Unsave a job")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(
            @PathVariable Long jobId,
            @CurrentUser UserPrincipal currentUser
    ) {
        savedJobService.unsaveJob(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job unsaved successfully", null));
    }
    
    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Check if job is saved")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkSaved(
            @PathVariable Long jobId,
            @CurrentUser UserPrincipal currentUser
    ) {
        boolean isSaved = savedJobService.isSaved(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Check completed", Map.of("isSaved", isSaved)));
    }
}