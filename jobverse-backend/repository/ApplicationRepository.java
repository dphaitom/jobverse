// File: src/main/java/com/jobverse/repository/ApplicationRepository.java

package com.jobverse.repository;

import com.jobverse.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // Kiểm tra đã ứng tuyển chưa
    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);
    
    // Lấy applications của candidate
    List<Application> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
    
    // Lấy applications theo job
    Page<Application> findByJobIdOrderByCreatedAtDesc(Long jobId, Pageable pageable);
    
    // Lấy applications cho employer (tất cả jobs của họ)
    @Query("SELECT a FROM Application a WHERE a.job.company.owner.id = :employerId ORDER BY a.createdAt DESC")
    Page<Application> findByEmployerId(@Param("employerId") Long employerId, Pageable pageable);
    
    // Lấy applications cho employer theo status
    @Query("SELECT a FROM Application a WHERE a.job.company.owner.id = :employerId AND a.status = :status ORDER BY a.createdAt DESC")
    Page<Application> findByEmployerIdAndStatus(@Param("employerId") Long employerId, @Param("status") Application.Status status, Pageable pageable);
    
    // Đếm applications theo status cho employer
    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.company.owner.id = :employerId AND a.status = :status")
    long countByEmployerIdAndStatus(@Param("employerId") Long employerId, @Param("status") Application.Status status);
    
    // Đếm tất cả applications cho employer
    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.company.owner.id = :employerId")
    long countByEmployerId(@Param("employerId") Long employerId);
    
    // Lấy application với đầy đủ thông tin
    @Query("SELECT a FROM Application a " +
           "LEFT JOIN FETCH a.job j " +
           "LEFT JOIN FETCH j.company c " +
           "LEFT JOIN FETCH a.candidate u " +
           "LEFT JOIN FETCH u.profile " +
           "WHERE a.id = :id")
    Optional<Application> findByIdWithDetails(@Param("id") Long id);
    
    // Lấy applications mới nhất cho employer dashboard
    @Query("SELECT a FROM Application a WHERE a.job.company.owner.id = :employerId ORDER BY a.createdAt DESC")
    List<Application> findRecentByEmployerId(@Param("employerId") Long employerId, Pageable pageable);
}
