// File: src/main/java/com/jobverse/service/SavedJobService.java

package com.jobverse.service;

import com.jobverse.dto.response.JobResponse;
import com.jobverse.entity.Job;
import com.jobverse.entity.SavedJob;
import com.jobverse.entity.User;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.repository.JobRepository;
import com.jobverse.repository.SavedJobRepository;
import com.jobverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedJobService {
    
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    
    /**
     * Lưu job
     */
    @Transactional
    public void saveJob(Long userId, Long jobId) {
        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            return; // Already saved
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        SavedJob savedJob = SavedJob.builder()
                .user(user)
                .job(job)
                .build();
        
        savedJobRepository.save(savedJob);
    }
    
    /**
     * Bỏ lưu job
     */
    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
    }
    
    /**
     * Kiểm tra đã lưu chưa
     */
    public boolean isSaved(Long userId, Long jobId) {
        return savedJobRepository.existsByUserIdAndJobId(userId, jobId);
    }
    
    /**
     * Lấy danh sách jobs đã lưu
     */
    public Page<JobResponse> getSavedJobs(Long userId, Pageable pageable) {
        Page<SavedJob> savedJobs = savedJobRepository.findByUserIdWithJob(userId, pageable);
        return savedJobs.map(sj -> {
            JobResponse response = JobResponse.fromEntity(sj.getJob());
            response.setSaved(true);
            response.setSavedAt(sj.getSavedAt());
            return response;
        });
    }
    
    /**
     * Lấy danh sách ID jobs đã lưu (để check trong list)
     */
    public Set<Long> getSavedJobIds(Long userId) {
        return savedJobRepository.findJobIdsByUserId(userId)
                .stream()
                .collect(Collectors.toSet());
    }
    
    /**
     * Đếm số jobs đã lưu
     */
    public long countSavedJobs(Long userId) {
        return savedJobRepository.countByUserId(userId);
    }
}
