package com.jobverse.repository;

import com.jobverse.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    
    @Modifying
    @Query("DELETE FROM SavedJob s WHERE s.user.id = :userId AND s.job.id = :jobId")
    void deleteByUserIdAndJobId(Long userId, Long jobId);
    
    Page<SavedJob> findByUserIdOrderBySavedAtDesc(Long userId, Pageable pageable);
    
    long countByUserId(Long userId);
}
