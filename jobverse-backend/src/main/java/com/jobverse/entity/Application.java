package com.jobverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "applications", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;
    
    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;
    
    @Column(name = "expected_salary", precision = 15, scale = 2)
    private BigDecimal expectedSalary;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;
    
    @Column(name = "ai_match_score")
    private Integer aiMatchScore;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_analysis", columnDefinition = "jsonb")
    private Map<String, Object> aiAnalysis;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;

    @Column(name = "is_quick_apply")
    @Builder.Default
    private Boolean isQuickApply = false;

    @Column(name = "is_anonymous")
    @Builder.Default
    private Boolean isAnonymous = false;

    public enum ApplicationStatus {
        PENDING,        // Chờ xem xét
        REVIEWING,      // Đang xem xét
        SHORTLISTED,    // Đã chọn vào danh sách ngắn
        INTERVIEW,      // Mời phỏng vấn
        OFFERED,        // Đã gửi offer
        HIRED,          // Đã tuyển
        REJECTED,       // Từ chối
        WITHDRAWN       // Ứng viên rút đơn
    }
}
