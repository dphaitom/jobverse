// File: src/main/java/com/jobverse/entity/SavedJob.java

package com.jobverse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_jobs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "job_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SavedJob {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime savedAt;
}

// ==================== REPOSITORY ====================
// File: src/main/java/com/jobverse/repository/SavedJobRepository.java

package com.jobverse.repository;

import com.jobverse.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    
    Optional<SavedJob> findByUserIdAndJobId(Long userId, Long jobId);
    
    @Query("SELECT sj FROM SavedJob sj " +
           "LEFT JOIN FETCH sj.job j " +
           "LEFT JOIN FETCH j.company " +
           "WHERE sj.user.id = :userId " +
           "ORDER BY sj.savedAt DESC")
    Page<SavedJob> findByUserIdWithJob(@Param("userId") Long userId, Pageable pageable);
    
    void deleteByUserIdAndJobId(Long userId, Long jobId);
    
    long countByUserId(Long userId);
    
    @Query("SELECT sj.job.id FROM SavedJob sj WHERE sj.user.id = :userId")
    List<Long> findJobIdsByUserId(@Param("userId") Long userId);
}
