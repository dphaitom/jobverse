package com.jobverse.controller;

import com.jobverse.dto.request.CompanyReviewRequest;
import com.jobverse.dto.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<CompanyReview>> createReview(
            @Valid @RequestBody CompanyReviewRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Creating review for company {} by user {}", request.getCompanyId(), userPrincipal.getId());

        CompanyReview review = reviewService.createReview(request, userPrincipal.getId());

        return ResponseEntity.ok(ApiResponse.success("Review created successfully", review));
    }

    @GetMapping("/company/{companyId}")
    @Operation(summary = "Get company reviews", description = "Get all approved reviews for a company")
    public ResponseEntity<ApiResponse<Page<CompanyReview>>> getCompanyReviews(
            @PathVariable Long companyId,
            Pageable pageable
    ) {
        log.info("Fetching reviews for company {}", companyId);

        Page<CompanyReview> reviews = reviewService.getCompanyReviews(companyId, pageable);

        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviews));
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user's reviews", description = "Get all reviews created by current user")
    public ResponseEntity<ApiResponse<Page<CompanyReview>>> getMyReviews(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable
    ) {
        log.info("Fetching reviews for user {}", userPrincipal.getId());

        Page<CompanyReview> reviews = reviewService.getUserReviews(userPrincipal.getId(), pageable);

        return ResponseEntity.ok(ApiResponse.success("Your reviews retrieved successfully", reviews));
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update review", description = "Update an existing review")
    public ResponseEntity<ApiResponse<CompanyReview>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody CompanyReviewRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Updating review {} by user {}", reviewId, userPrincipal.getId());

        CompanyReview review = reviewService.updateReview(reviewId, request, userPrincipal.getId());

        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", review));
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
    public ResponseEntity<ApiResponse<Page<CompanyReview>>> getPendingReviews(Pageable pageable) {
        log.info("Admin: Fetching pending reviews");

        Page<CompanyReview> reviews = reviewService.getPendingReviews(pageable);

        return ResponseEntity.ok(ApiResponse.success("Pending reviews retrieved", reviews));
    }

    @PutMapping("/admin/{reviewId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve review", description = "Approve a pending review")
    public ResponseEntity<ApiResponse<CompanyReview>> approveReview(@PathVariable Long reviewId) {
        log.info("Admin: Approving review {}", reviewId);

        CompanyReview review = reviewService.approveReview(reviewId);

        return ResponseEntity.ok(ApiResponse.success("Review approved successfully", review));
    }

    @PutMapping("/admin/{reviewId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject review", description = "Reject a pending review")
    public ResponseEntity<ApiResponse<CompanyReview>> rejectReview(@PathVariable Long reviewId) {
        log.info("Admin: Rejecting review {}", reviewId);

        CompanyReview review = reviewService.rejectReview(reviewId);

        return ResponseEntity.ok(ApiResponse.success("Review rejected successfully", review));
    }
}
