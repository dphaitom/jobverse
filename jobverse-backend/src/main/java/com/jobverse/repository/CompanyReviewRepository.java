package com.jobverse.repository;

import com.jobverse.entity.CompanyReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyReviewRepository extends JpaRepository<CompanyReview, Long> {

    @EntityGraph(attributePaths = {"company", "user", "user.profile"})
    @Query("SELECT r FROM CompanyReview r WHERE r.company.id = :companyId AND r.status = :status ORDER BY r.createdAt DESC")
    Page<CompanyReview> findByCompanyIdAndStatusWithDetails(
            @Param("companyId") Long companyId, 
            @Param("status") CompanyReview.ReviewStatus status, 
            Pageable pageable);

    @EntityGraph(attributePaths = {"company", "user", "user.profile"})
    @Query("SELECT r FROM CompanyReview r WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    Page<CompanyReview> findByUserIdWithDetails(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT r FROM CompanyReview r " +
           "LEFT JOIN FETCH r.company " +
           "LEFT JOIN FETCH r.user u " +
           "LEFT JOIN FETCH u.profile " +
           "WHERE r.id = :id")
    Optional<CompanyReview> findByIdWithDetails(@Param("id") Long id);

    boolean existsByCompanyIdAndUserId(Long companyId, Long userId);

    @Query("SELECT AVG(r.rating) FROM CompanyReview r WHERE r.company.id = :companyId AND r.status = 'APPROVED'")
    Double getAverageRating(@Param("companyId") Long companyId);

    @Query("SELECT COUNT(r) FROM CompanyReview r WHERE r.company.id = :companyId AND r.status = 'APPROVED'")
    Long countApprovedReviews(@Param("companyId") Long companyId);

    @EntityGraph(attributePaths = {"company", "user", "user.profile"})
    @Query("SELECT r FROM CompanyReview r WHERE r.status = :status ORDER BY r.createdAt DESC")
    Page<CompanyReview> findByStatusWithDetails(@Param("status") CompanyReview.ReviewStatus status, Pageable pageable);

    List<CompanyReview> findTop5ByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, CompanyReview.ReviewStatus status);

    // Keep legacy methods for backward compatibility
    Page<CompanyReview> findByCompanyIdAndStatus(Long companyId, CompanyReview.ReviewStatus status, Pageable pageable);
    Page<CompanyReview> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query("SELECT r FROM CompanyReview r WHERE r.status = :status ORDER BY r.createdAt DESC")
    Page<CompanyReview> findByStatus(CompanyReview.ReviewStatus status, Pageable pageable);
}
