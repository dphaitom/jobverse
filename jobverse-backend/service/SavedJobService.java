package com.jobverse.service;

import com.jobverse.dto.response.JobResponse;
import com.jobverse.entity.Job;
import com.jobverse.entity.SavedJob;
import com.jobverse.entity.User;
import com.jobverse.exception.BadRequestException;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.repository.JobRepository;
import com.jobverse.repository.SavedJobRepository;
import com.jobverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedJobService {
    
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    
    public List<JobResponse> getSavedJobs(Long userId) {
        List<SavedJob> savedJobs = savedJobRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return savedJobs.stream()
                .map(savedJob -> JobResponse.fromEntity(savedJob.getJob()))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void saveJob(Long userId, Long jobId) {
        // Check if already saved
        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new BadRequestException("Job already saved");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        SavedJob savedJob = new SavedJob();
        savedJob.setUser(user);
        savedJob.setJob(job);
        
        savedJobRepository.save(savedJob);
    }
    
    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        SavedJob savedJob = savedJobRepository.findByUserIdAndJobId(userId, jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved job not found"));
        
        savedJobRepository.delete(savedJob);
    }
    
    public boolean isSaved(Long userId, Long jobId) {
        return savedJobRepository.existsByUserIdAndJobId(userId, jobId);
    }
}