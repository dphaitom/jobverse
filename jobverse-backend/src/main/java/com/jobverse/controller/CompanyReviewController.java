package com.jobverse.controller;

import com.jobverse.dto.request.CompanyReviewRequest;
import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.CompanyReviewResponse;
import com.jobverse.entity.CompanyReview;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.CompanyReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/v1/company-reviews")
@RequiredArgsConstructor
@Tag(name = "Company Reviews", description = "Company review management APIs")
public class CompanyReviewController {

    private final CompanyReviewService reviewService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create company review", description = "Create a new review for a company")
    public ResponseEntity<ApiResponse<CompanyReviewResponse>> createReview(
            @Valid @RequestBody CompanyReviewRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Creating review for company {} by user {}", request.getCompanyId(), userPrincipal.getId());

        CompanyReview review = reviewService.createReview(request, userPrincipal.getId());
        CompanyReviewResponse response = CompanyReviewResponse.fromEntity(review);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created successfully", response));
    }

    @GetMapping("/company/{companyId}")
    @Operation(summary = "Get company reviews", description = "Get all approved reviews for a company")
    public ResponseEntity<ApiResponse<Page<CompanyReviewResponse>>> getCompanyReviews(
            @PathVariable Long companyId,
            Pageable pageable
    ) {
        log.info("Fetching reviews for company {}", companyId);

        Page<CompanyReview> reviews = reviewService.getCompanyReviews(companyId, pageable);
        Page<CompanyReviewResponse> response = reviews.map(CompanyReviewResponse::fromEntity);

        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", response));
    }

    @GetMapping("/eligibility/{companyId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check review eligibility", description = "Check if current user can review a company")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> checkEligibility(
            @PathVariable Long companyId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Checking review eligibility for company {} by user {}", companyId, userPrincipal.getId());

        boolean canReview = reviewService.canUserReviewCompany(userPrincipal.getId(), companyId);
        boolean hasReviewed = reviewService.hasUserReviewedCompany(userPrincipal.getId(), companyId);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("canReview", canReview && !hasReviewed);
        result.put("hasApplied", canReview);
        result.put("hasReviewed", hasReviewed);

        return ResponseEntity.ok(ApiResponse.success("Eligibility checked", result));
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user's reviews", description = "Get all reviews created by current user")
    public ResponseEntity<ApiResponse<Page<CompanyReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable
    ) {
        log.info("Fetching reviews for user {}", userPrincipal.getId());

        Page<CompanyReview> reviews = reviewService.getUserReviews(userPrincipal.getId(), pageable);
        Page<CompanyReviewResponse> response = reviews.map(CompanyReviewResponse::fromEntity);

        return ResponseEntity.ok(ApiResponse.success("Your reviews retrieved successfully", response));
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update review", description = "Update an existing review")
    public ResponseEntity<ApiResponse<CompanyReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody CompanyReviewRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Updating review {} by user {}", reviewId, userPrincipal.getId());

        CompanyReview review = reviewService.updateReview(reviewId, request, userPrincipal.getId());
        CompanyReviewResponse response = CompanyReviewResponse.fromEntity(review);

        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete review", description = "Delete a review")
    public ResponseEntity<ApiResponse<String>> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Deleting review {} by user {}", reviewId, userPrincipal.getId());

        reviewService.deleteReview(reviewId, userPrincipal.getId());

        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    // Admin endpoints
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get pending reviews", description = "Get all pending reviews for moderation")
    public ResponseEntity<ApiResponse<Page<CompanyReviewResponse>>> getPendingReviews(Pageable pageable) {
        log.info("Admin: Fetching pending reviews");

        Page<CompanyReview> reviews = reviewService.getPendingReviews(pageable);
        Page<CompanyReviewResponse> response = reviews.map(CompanyReviewResponse::fromEntity);

        return ResponseEntity.ok(ApiResponse.success("Pending reviews retrieved", response));
    }

    @PutMapping("/admin/{reviewId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve review", description = "Approve a pending review")
    public ResponseEntity<ApiResponse<CompanyReviewResponse>> approveReview(@PathVariable Long reviewId) {
        log.info("Admin: Approving review {}", reviewId);

        CompanyReview review = reviewService.approveReview(reviewId);
        CompanyReviewResponse response = CompanyReviewResponse.fromEntity(review);

        return ResponseEntity.ok(ApiResponse.success("Review approved successfully", response));
    }

    @PutMapping("/admin/{reviewId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject review", description = "Reject a pending review")
    public ResponseEntity<ApiResponse<CompanyReviewResponse>> rejectReview(@PathVariable Long reviewId) {
        log.info("Admin: Rejecting review {}", reviewId);

        CompanyReview review = reviewService.rejectReview(reviewId);
        CompanyReviewResponse response = CompanyReviewResponse.fromEntity(review);

        return ResponseEntity.ok(ApiResponse.success("Review rejected successfully", response));
    }
}
