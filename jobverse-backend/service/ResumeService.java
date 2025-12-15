// File: src/main/java/com/jobverse/service/ResumeService.java

package com.jobverse.service;

import com.jobverse.dto.response.ResumeResponse;
import com.jobverse.entity.Resume;
import com.jobverse.entity.User;
import com.jobverse.exception.BadRequestException;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.exception.UnauthorizedException;
import com.jobverse.repository.ResumeRepository;
import com.jobverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeService {
    
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    
    private static final int MAX_RESUMES_PER_USER = 5;
    
    /**
     * Upload CV mới
     */
    @Transactional
    public ResumeResponse uploadResume(Long userId, MultipartFile file, String title, boolean setAsDefault) {
        // Kiểm tra số lượng CV
        long count = resumeRepository.countByUserId(userId);
        if (count >= MAX_RESUMES_PER_USER) {
            throw new BadRequestException("Maximum " + MAX_RESUMES_PER_USER + " resumes allowed. Please delete one before uploading.");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Upload file
        FileStorageService.FileUploadResult uploadResult = fileStorageService.uploadResume(file, userId);
        
        // Nếu set as default, clear default cũ
        if (setAsDefault) {
            resumeRepository.clearDefaultForUser(userId);
        }
        
        // Nếu là CV đầu tiên, tự động set làm default
        boolean isFirstResume = count == 0;
        
        Resume resume = Resume.builder()
                .user(user)
                .fileName(uploadResult.getFileName())
                .fileUrl(uploadResult.getFileUrl())
                .filePath(uploadResult.getFilePath())
                .fileSize(uploadResult.getFileSize())
                .mimeType(uploadResult.getMimeType())
                .title(title != null ? title : uploadResult.getFileName())
                .isDefault(setAsDefault || isFirstResume)
                .build();
        
        Resume saved = resumeRepository.save(resume);
        return ResumeResponse.fromEntity(saved);
    }
    
    /**
     * Lấy danh sách CV của user
     */
    public List<ResumeResponse> getMyResumes(Long userId) {
        List<Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return resumes.stream()
                .map(ResumeResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy CV default
     */
    public ResumeResponse getDefaultResume(Long userId) {
        Resume resume = resumeRepository.findByUserIdAndIsDefaultTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No default resume found"));
        return ResumeResponse.fromEntity(resume);
    }
    
    /**
     * Set CV làm default
     */
    @Transactional
    public ResumeResponse setAsDefault(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        
        if (!resume.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to modify this resume");
        }
        
        resumeRepository.clearDefaultForUser(userId);
        resume.setDefault(true);
        Resume updated = resumeRepository.save(resume);
        
        return ResumeResponse.fromEntity(updated);
    }
    
    /**
     * Xóa CV
     */
    @Transactional
    public void deleteResume(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        
        if (!resume.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to delete this resume");
        }
        
        // Xóa file
        fileStorageService.deleteFile(resume.getFilePath());
        
        // Xóa record
        resumeRepository.delete(resume);
        
        // Nếu là default, set CV khác làm default
        if (resume.isDefault()) {
            List<Resume> remaining = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setDefault(true);
                resumeRepository.save(remaining.get(0));
            }
        }
    }
    
    /**
     * Cập nhật title CV
     */
    @Transactional
    public ResumeResponse updateTitle(Long resumeId, Long userId, String newTitle) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        
        if (!resume.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to modify this resume");
        }
        
        resume.setTitle(newTitle);
        Resume updated = resumeRepository.save(resume);
        
        return ResumeResponse.fromEntity(updated);
    }
}
