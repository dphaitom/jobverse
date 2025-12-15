// File: src/main/java/com/jobverse/entity/Resume.java

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
@Table(name = "resumes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Resume {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String fileName; // Tên file gốc
    
    @Column(nullable = false)
    private String fileUrl; // URL để download
    
    @Column(nullable = false)
    private String filePath; // Đường dẫn lưu trữ
    
    private Long fileSize; // Kích thước file (bytes)
    
    private String mimeType; // application/pdf, etc.
    
    private String title; // Tiêu đề CV (VD: "CV Senior Developer")
    
    private boolean isDefault; // CV mặc định
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
