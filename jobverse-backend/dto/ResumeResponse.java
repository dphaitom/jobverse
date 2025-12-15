// File: src/main/java/com/jobverse/dto/response/ResumeResponse.java

package com.jobverse.dto.response;

import com.jobverse.entity.Resume;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ResumeResponse {
    
    private Long id;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String mimeType;
    private String title;
    private boolean isDefault;
    private LocalDateTime createdAt;
    
    // Formatted file size
    private String fileSizeFormatted;
    
    public static ResumeResponse fromEntity(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .fileUrl(resume.getFileUrl())
                .fileSize(resume.getFileSize())
                .mimeType(resume.getMimeType())
                .title(resume.getTitle())
                .isDefault(resume.isDefault())
                .createdAt(resume.getCreatedAt())
                .fileSizeFormatted(formatFileSize(resume.getFileSize()))
                .build();
    }
    
    private static String formatFileSize(Long bytes) {
        if (bytes == null) return "Unknown";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }
}
