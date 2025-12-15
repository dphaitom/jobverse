// File: src/main/java/com/jobverse/controller/ResumeController.java

package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.ResumeResponse;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/resumes")
@RequiredArgsConstructor
@Tag(name = "Resumes", description = "Resume/CV Management APIs")
public class ResumeController {
    
    private final ResumeService resumeService;
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Upload a new resume")
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "setAsDefault", defaultValue = "false") boolean setAsDefault
    ) {
        ResumeResponse response = resumeService.uploadResume(currentUser.getId(), file, title, setAsDefault);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume uploaded successfully", response));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get my resumes")
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> getMyResumes(
            @CurrentUser UserPrincipal currentUser
    ) {
        List<ResumeResponse> resumes = resumeService.getMyResumes(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Resumes retrieved", resumes));
    }
    
    @GetMapping("/default")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get default resume")
    public ResponseEntity<ApiResponse<ResumeResponse>> getDefaultResume(
            @CurrentUser UserPrincipal currentUser
    ) {
        ResumeResponse response = resumeService.getDefaultResume(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Default resume retrieved", response));
    }
    
    @PutMapping("/{id}/default")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Set resume as default")
    public ResponseEntity<ApiResponse<ResumeResponse>> setAsDefault(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        ResumeResponse response = resumeService.setAsDefault(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Default resume updated", response));
    }
    
    @PutMapping("/{id}/title")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update resume title")
    public ResponseEntity<ApiResponse<ResumeResponse>> updateTitle(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, String> request
    ) {
        ResumeResponse response = resumeService.updateTitle(id, currentUser.getId(), request.get("title"));
        return ResponseEntity.ok(ApiResponse.success("Title updated", response));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Delete a resume")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser
    ) {
        resumeService.deleteResume(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Resume deleted", null));
    }
}
