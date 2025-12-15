// File: src/main/java/com/jobverse/repository/ResumeRepository.java

package com.jobverse.repository;

import com.jobverse.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    
    List<Resume> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<Resume> findByUserIdAndIsDefaultTrue(Long userId);
    
    long countByUserId(Long userId);
    
    @Modifying
    @Query("UPDATE Resume r SET r.isDefault = false WHERE r.user.id = :userId")
    void clearDefaultForUser(@Param("userId") Long userId);
    
    boolean existsByIdAndUserId(Long id, Long userId);
}
