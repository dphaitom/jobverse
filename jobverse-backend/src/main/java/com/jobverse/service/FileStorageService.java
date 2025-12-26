package com.jobverse.service;

import com.jobverse.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {
    
    private final Path fileStorageLocation;
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList("image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("📁 File storage location: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }
    
    public String storeFile(MultipartFile file, String folder) {
        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot upload empty file");
        }
        
        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum limit of 5MB");
        }
        
        // Validate file type for images
        String contentType = file.getContentType();
        if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new BadRequestException("Only image files (JPEG, PNG, GIF, WebP) are allowed");
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String fileName = UUID.randomUUID().toString() + fileExtension;
        
        try {
            // Create folder if not exists
            Path folderPath = this.fileStorageLocation.resolve(folder);
            Files.createDirectories(folderPath);
            
            // Copy file to target location
            Path targetLocation = folderPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("✅ File stored: {}/{}", folder, fileName);
            
            // Return relative URL
            return "/" + folder + "/" + fileName;
        } catch (IOException ex) {
            log.error("❌ Failed to store file: {}", ex.getMessage());
            throw new RuntimeException("Failed to store file", ex);
        }
    }
    
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        
        try {
            // Remove leading slash
            String filePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
            Path targetPath = this.fileStorageLocation.resolve(filePath);
            Files.deleteIfExists(targetPath);
            log.info("🗑️ File deleted: {}", filePath);
        } catch (IOException ex) {
            log.warn("⚠️ Could not delete file: {}", fileUrl);
        }
    }
}
