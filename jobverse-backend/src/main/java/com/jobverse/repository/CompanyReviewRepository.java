package com.jobverse.repository;

import com.jobverse.entity.CompanyReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyReviewRepository extends JpaRepository<CompanyReview, Long> {

    Page<CompanyReview> findByCompanyIdAndStatus(Long companyId, CompanyReview.ReviewStatus status, Pageable pageable);

    Page<CompanyReview> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    boolean existsByCompanyIdAndUserId(Long companyId, Long userId);

    @Query("SELECT AVG(r.rating) FROM CompanyReview r WHERE r.company.id = :companyId AND r.status = 'APPROVED'")
    Double getAverageRating(Long companyId);

    @Query("SELECT COUNT(r) FROM CompanyReview r WHERE r.company.id = :companyId AND r.status = 'APPROVED'")
    Long countApprovedReviews(Long companyId);

    @Query("SELECT r FROM CompanyReview r WHERE r.status = :status ORDER BY r.createdAt DESC")
    Page<CompanyReview> findByStatus(CompanyReview.ReviewStatus status, Pageable pageable);

    List<CompanyReview> findTop5ByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, CompanyReview.ReviewStatus status);
}
