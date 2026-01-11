package com.jobverse.service;

import com.jobverse.dto.request.CompanyReviewRequest;
import com.jobverse.entity.Company;
import com.jobverse.entity.CompanyReview;
import com.jobverse.entity.User;
import com.jobverse.repository.ApplicationRepository;
import com.jobverse.repository.CompanyRepository;
import com.jobverse.repository.CompanyReviewRepository;
import com.jobverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyReviewService {

    private final CompanyReviewRepository reviewRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    /**
     * Check if user is eligible to review a company
     * Any candidate can review (removed applicant-only restriction)
     */
    public boolean canUserReviewCompany(Long userId, Long companyId) {
        // Any candidate can review - check will be done in createReview
        return true;
    }

    /**
     * Check if user has already reviewed this company
     */
    public boolean hasUserReviewedCompany(Long userId, Long companyId) {
        return reviewRepository.existsByCompanyIdAndUserId(companyId, userId);
    }

    @Transactional
    public CompanyReview createReview(CompanyReviewRequest request, Long userId) {
        log.info("Creating review for company {} by user {}", request.getCompanyId(), userId);

        // Check if user already reviewed this company
        if (reviewRepository.existsByCompanyIdAndUserId(request.getCompanyId(), userId)) {
            throw new RuntimeException("Bạn đã đánh giá công ty này rồi");
        }

        // Get company and user with profile
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty"));
        User user = userRepository.findByIdWithProfile(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Check if user is a candidate
        if (user.getRole() != User.Role.CANDIDATE) {
            throw new RuntimeException("Chỉ ứng viên mới có thể đánh giá công ty");
        }

        // Create review
        CompanyReview review = CompanyReview.builder()
                .company(company)
                .user(user)
                .rating(request.getRating())
                .title(request.getTitle())
                .pros(request.getPros())
                .cons(request.getCons())
                .isCurrentEmployee(request.getIsCurrentEmployee() != null ? request.getIsCurrentEmployee() : false)
                .jobTitle(request.getJobTitle())
                .status(CompanyReview.ReviewStatus.APPROVED) // Auto-approve for now
                .build();

        CompanyReview savedReview = reviewRepository.save(review);

        // Update company rating
        updateCompanyRating(company.getId());

        log.info("Review created successfully with ID: {}", savedReview.getId());
        
        // Return review with all relations loaded
        return savedReview;
    }

    @Transactional(readOnly = true)
    public Page<CompanyReview> getCompanyReviews(Long companyId, Pageable pageable) {
        return reviewRepository.findByCompanyIdAndStatusWithDetails(
                companyId,
                CompanyReview.ReviewStatus.APPROVED,
                pageable
        );
    }

    @Transactional(readOnly = true)
    public Page<CompanyReview> getUserReviews(Long userId, Pageable pageable) {
        return reviewRepository.findByUserIdWithDetails(userId, pageable);
    }

    @Transactional
    public void updateCompanyRating(Long companyId) {
        Double averageRating = reviewRepository.getAverageRating(companyId);
        Long reviewCount = reviewRepository.countApprovedReviews(companyId);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (averageRating != null) {
            company.setRatingAvg(BigDecimal.valueOf(averageRating).setScale(2, RoundingMode.HALF_UP));
        } else {
            company.setRatingAvg(BigDecimal.ZERO);
        }

        company.setReviewCount(reviewCount != null ? reviewCount.intValue() : 0);
        companyRepository.save(company);

        log.info("Updated company {} rating to {} with {} reviews", companyId, company.getRatingAvg(), company.getReviewCount());
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        CompanyReview review = reviewRepository.findByIdWithDetails(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // Only owner can delete
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        Long companyId = review.getCompany().getId();
        reviewRepository.delete(review);

        // Update company rating
        updateCompanyRating(companyId);

        log.info("Review {} deleted by user {}", reviewId, userId);
    }

    @Transactional
    public CompanyReview updateReview(Long reviewId, CompanyReviewRequest request, Long userId) {
        CompanyReview review = reviewRepository.findByIdWithDetails(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // Only owner can update
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own reviews");
        }

        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setPros(request.getPros());
        review.setCons(request.getCons());
        review.setIsCurrentEmployee(request.getIsCurrentEmployee());
        review.setJobTitle(request.getJobTitle());
        review.setStatus(CompanyReview.ReviewStatus.PENDING); // Re-moderate after edit

        CompanyReview updated = reviewRepository.save(review);

        // Update company rating
        updateCompanyRating(review.getCompany().getId());

        log.info("Review {} updated by user {}", reviewId, userId);
        return updated;
    }

    // Admin methods
    @Transactional(readOnly = true)
    public Page<CompanyReview> getPendingReviews(Pageable pageable) {
        return reviewRepository.findByStatusWithDetails(CompanyReview.ReviewStatus.PENDING, pageable);
    }

    @Transactional
    public CompanyReview approveReview(Long reviewId) {
        CompanyReview review = reviewRepository.findByIdWithDetails(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setStatus(CompanyReview.ReviewStatus.APPROVED);
        CompanyReview approved = reviewRepository.save(review);

        updateCompanyRating(review.getCompany().getId());

        log.info("Review {} approved", reviewId);
        return approved;
    }

    @Transactional
    public CompanyReview rejectReview(Long reviewId) {
        CompanyReview review = reviewRepository.findByIdWithDetails(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setStatus(CompanyReview.ReviewStatus.REJECTED);
        CompanyReview rejected = reviewRepository.save(review);

        updateCompanyRating(review.getCompany().getId());

        log.info("Review {} rejected", reviewId);
        return rejected;
    }
}
