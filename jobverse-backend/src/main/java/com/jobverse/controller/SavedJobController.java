package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.JobResponse;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.SavedJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/v1/saved-jobs")
@RequiredArgsConstructor
@Tag(name = "Saved Jobs", description = "Saved Jobs APIs")
public class SavedJobController {

    private final SavedJobService savedJobService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all saved jobs")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getSavedJobs(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        log.info("User {} fetching saved jobs", currentUser.getId());
        Page<JobResponse> savedJobs = savedJobService.getSavedJobs(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Saved jobs retrieved", savedJobs));
    }

    @PostMapping("/{jobId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Save a job")
    public ResponseEntity<ApiResponse<Void>> saveJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("User {} saving job {}", currentUser.getId(), jobId);
        savedJobService.saveJob(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job saved successfully", null));
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Unsave a job")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("User {} unsaving job {}", currentUser.getId(), jobId);
        savedJobService.unsaveJob(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job unsaved successfully", null));
    }

    @GetMapping("/check/{jobId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if job is saved")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkSaved(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        boolean isSaved = savedJobService.isSaved(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Check completed", Map.of("isSaved", isSaved)));
    }

    @GetMapping("/ids")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get saved job IDs")
    public ResponseEntity<ApiResponse<Set<Long>>> getSavedJobIds(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Set<Long> savedJobIds = savedJobService.getSavedJobIds(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Saved job IDs retrieved", savedJobIds));
    }

    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get saved jobs count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCount(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        long count = savedJobService.countSavedJobs(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Count retrieved", Map.of("count", count)));
    }
}
