package com.jobverse.repository;

import com.jobverse.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    boolean existsByJobIdAndUserId(Long jobId, Long userId);
    
    Optional<Application> findByJobIdAndUserId(Long jobId, Long userId);
    
    @Query("SELECT a FROM Application a " +
           "LEFT JOIN FETCH a.user u " +
           "LEFT JOIN FETCH u.profile " +
           "LEFT JOIN FETCH a.resume " +
           "WHERE a.id = :id")
    Optional<Application> findByIdWithDetails(Long id);
    
    @Query("SELECT a FROM Application a WHERE a.user.id = :userId ORDER BY a.appliedAt DESC")
    Page<Application> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT a FROM Application a " +
           "LEFT JOIN FETCH a.user u " +
           "LEFT JOIN FETCH u.profile " +
           "WHERE a.job.id = :jobId " +
           "ORDER BY a.aiMatchScore DESC NULLS LAST, a.appliedAt DESC")
    Page<Application> findByJobIdOrderByMatchScore(Long jobId, Pageable pageable);
    
    @Query("SELECT a FROM Application a WHERE a.job.id = :jobId AND a.status = :status")
    Page<Application> findByJobIdAndStatus(Long jobId, Application.ApplicationStatus status, Pageable pageable);
    
    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.id = :jobId")
    long countByJobId(Long jobId);
    
    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.job.id = :jobId GROUP BY a.status")
    List<Object[]> countByJobIdGroupByStatus(Long jobId);
    
    @Query("SELECT a FROM Application a WHERE a.user.id = :userId AND a.status IN :statuses")
    List<Application> findByUserIdAndStatusIn(Long userId, List<Application.ApplicationStatus> statuses);

    @Query("SELECT a FROM Application a " +
           "LEFT JOIN FETCH a.job j " +
           "LEFT JOIN FETCH j.company c " +
           "LEFT JOIN FETCH a.user u " +
           "LEFT JOIN FETCH u.profile " +
           "LEFT JOIN FETCH a.resume " +
           "WHERE a.user.id = :userId " +
           "ORDER BY a.appliedAt DESC")
    Page<Application> findByUserIdOrderByAppliedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT a FROM Application a " +
           "LEFT JOIN FETCH a.job j " +
           "LEFT JOIN FETCH j.company c " +
           "LEFT JOIN FETCH a.user u " +
           "LEFT JOIN FETCH u.profile " +
           "LEFT JOIN FETCH a.resume " +
           "WHERE a.job.id = :jobId " +
           "ORDER BY a.appliedAt DESC")
    Page<Application> findByJobIdOrderByAppliedAtDesc(Long jobId, Pageable pageable);

    @Query("SELECT a.job.id FROM Application a WHERE a.user.id = :userId")
    List<Long> findJobIdsByUserId(Long userId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Application a " +
           "WHERE a.user.id = :userId AND a.job.company.id = :companyId")
    boolean existsByUserIdAndCompanyId(Long userId, Long companyId);
}
