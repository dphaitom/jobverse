package com.jobverse.repository;

import com.jobverse.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Resume> findByUserIdAndIsPrimaryTrue(Long userId);

    boolean existsByUserIdAndIsPrimaryTrue(Long userId);
}
