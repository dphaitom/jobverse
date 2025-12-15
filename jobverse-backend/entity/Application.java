// File: src/main/java/com/jobverse/entity/Application.java

package com.jobverse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"job_id", "candidate_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Application {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;
    
    @Column(columnDefinition = "TEXT")
    private String coverLetter;
    
    private String expectedSalary;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String employerNote;
    
    private LocalDateTime interviewDate;
    
    private String interviewLocation;
    
    @Column(columnDefinition = "TEXT")
    private String interviewNote;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum Status {
        PENDING,      // Chờ xem xét
        REVIEWING,    // Đang xem xét
        INTERVIEW,    // Mời phỏng vấn
        ACCEPTED,     // Được nhận
        REJECTED,     // Bị từ chối
        WITHDRAWN     // Ứng viên rút đơn
    }
}
