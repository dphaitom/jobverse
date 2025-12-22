package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.JobResponse;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.SavedJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/v1/saved-jobs")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Saved Jobs", description = "Saved Jobs APIs")
public class SavedJobController {

    private final SavedJobService savedJobService;

    @PostMapping("/{jobId}")
    @Operation(summary = "Save a job")
    public ResponseEntity<ApiResponse<Void>> saveJob(
            @PathVariable Long jobId,
            @CurrentUser UserPrincipal currentUser
    ) {
        savedJobService.saveJob(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job saved", null));
    }

    @DeleteMapping("/{jobId}")
    @Operation(summary = "Unsave a job")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(
            @PathVariable Long jobId,
            @CurrentUser UserPrincipal currentUser
    ) {
        savedJobService.unsaveJob(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job removed from saved", null));
    }

    @GetMapping
    @Operation(summary = "Get saved jobs")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getSavedJobs(
            @CurrentUser UserPrincipal currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<JobResponse> jobs = savedJobService.getSavedJobs(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Saved jobs retrieved", jobs));
    }

    @GetMapping("/check/{jobId}")
    @Operation(summary = "Check if job is saved")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkSaved(
            @PathVariable Long jobId,
            @CurrentUser UserPrincipal currentUser
    ) {
        boolean isSaved = savedJobService.isSaved(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Check completed", Map.of("isSaved", isSaved)));
    }

    @GetMapping("/ids")
    @Operation(summary = "Get saved job IDs")
    public ResponseEntity<ApiResponse<Set<Long>>> getSavedJobIds(
            @CurrentUser UserPrincipal currentUser
    ) {
        Set<Long> ids = savedJobService.getSavedJobIds(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Saved job IDs retrieved", ids));
    }

    @GetMapping("/count")
    @Operation(summary = "Get saved jobs count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCount(
            @CurrentUser UserPrincipal currentUser
    ) {
        long count = savedJobService.countSavedJobs(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Count retrieved", Map.of("count", count)));
    }
}
