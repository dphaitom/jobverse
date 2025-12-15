// File: src/main/java/com/jobverse/service/FileStorageService.java

package com.jobverse.service;

import com.jobverse.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${app.upload.max-size:10485760}") // 10MB default
    private long maxFileSize;
    
    private Path uploadPath;
    
    private static final List<String> ALLOWED_RESUME_TYPES = Arrays.asList(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    );
    
    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
            Files.createDirectories(uploadPath.resolve("resumes"));
            Files.createDirectories(uploadPath.resolve("avatars"));
            Files.createDirectories(uploadPath.resolve("logos"));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directories", e);
        }
    }
    
    /**
     * Upload resume file (PDF, DOC, DOCX)
     */
    public FileUploadResult uploadResume(MultipartFile file, Long userId) {
        validateFile(file, ALLOWED_RESUME_TYPES, maxFileSize);
        
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getFileExtension(originalFileName);
        String newFileName = String.format("resume_%d_%s.%s", userId, UUID.randomUUID().toString().substring(0, 8), extension);
        
        Path targetPath = uploadPath.resolve("resumes").resolve(newFileName);
        
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
        
        return FileUploadResult.builder()
                .fileName(originalFileName)
                .filePath(targetPath.toString())
                .fileUrl("/uploads/resumes/" + newFileName)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .build();
    }
    
    /**
     * Upload avatar image
     */
    public FileUploadResult uploadAvatar(MultipartFile file, Long userId) {
        validateFile(file, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024); // 5MB max
        
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getFileExtension(originalFileName);
        String newFileName = String.format("avatar_%d_%s.%s", userId, UUID.randomUUID().toString().substring(0, 8), extension);
        
        Path targetPath = uploadPath.resolve("avatars").resolve(newFileName);
        
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
        
        return FileUploadResult.builder()
                .fileName(originalFileName)
                .filePath(targetPath.toString())
                .fileUrl("/uploads/avatars/" + newFileName)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .build();
    }
    
    /**
     * Upload company logo
     */
    public FileUploadResult uploadLogo(MultipartFile file, Long companyId) {
        validateFile(file, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024);
        
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getFileExtension(originalFileName);
        String newFileName = String.format("logo_%d_%s.%s", companyId, UUID.randomUUID().toString().substring(0, 8), extension);
        
        Path targetPath = uploadPath.resolve("logos").resolve(newFileName);
        
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
        
        return FileUploadResult.builder()
                .fileName(originalFileName)
                .filePath(targetPath.toString())
                .fileUrl("/uploads/logos/" + newFileName)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .build();
    }
    
    /**
     * Delete file
     */
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log error but don't throw
            System.err.println("Failed to delete file: " + filePath);
        }
    }
    
    /**
     * Validate file
     */
    private void validateFile(MultipartFile file, List<String> allowedTypes, long maxSize) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        
        if (file.getSize() > maxSize) {
            throw new BadRequestException("File size exceeds maximum allowed size of " + (maxSize / 1024 / 1024) + "MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BadRequestException("File type not allowed. Allowed types: " + String.join(", ", allowedTypes));
        }
        
        String fileName = file.getOriginalFilename();
        if (fileName != null && fileName.contains("..")) {
            throw new BadRequestException("Invalid file name");
        }
    }
    
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "bin";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
    
    // Result class
    @lombok.Data
    @lombok.Builder
    public static class FileUploadResult {
        private String fileName;
        private String filePath;
        private String fileUrl;
        private Long fileSize;
        private String mimeType;
    }
}
