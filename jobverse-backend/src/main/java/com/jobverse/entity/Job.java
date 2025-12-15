package com.jobverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, unique = true)
    private String slug;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String requirements;
    
    @Column(columnDefinition = "TEXT")
    private String responsibilities;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    private JobType jobType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", nullable = false)
    private ExperienceLevel experienceLevel;
    
    @Column(name = "salary_min", precision = 15, scale = 2)
    private BigDecimal salaryMin;
    
    @Column(name = "salary_max", precision = 15, scale = 2)
    private BigDecimal salaryMax;
    
    @Column(name = "salary_negotiable")
    @Builder.Default
    private Boolean salaryNegotiable = false;
    
    @Builder.Default
    private String currency = "VND";
    
    @Column(nullable = false)
    private String location;
    
    @Column(name = "is_remote")
    @Builder.Default
    private Boolean isRemote = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "remote_type")
    private RemoteType remoteType;
    
    @Column(name = "positions_count")
    @Builder.Default
    private Integer positionsCount = 1;
    
    private LocalDate deadline;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JobStatus status = JobStatus.DRAFT;
    
    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;
    
    @Column(name = "is_urgent")
    @Builder.Default
    private Boolean isUrgent = false;
    
    @Column(name = "video_intro_url")
    private String videoIntroUrl;
    
    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;
    
    @Column(name = "application_count")
    @Builder.Default
    private Integer applicationCount = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<JobSkill> skills = new HashSet<>();
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<JobBenefit> benefits = new HashSet<>();
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Application> applications = new HashSet<>();
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<SavedJob> savedBy = new HashSet<>();
    
    public enum JobType {
        FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
    }
    
    public enum ExperienceLevel {
        ENTRY, JUNIOR, MID, SENIOR, LEAD, MANAGER, DIRECTOR
    }
    
    public enum RemoteType {
        FULL_REMOTE, HYBRID, ONSITE
    }
    
    public enum JobStatus {
        DRAFT, ACTIVE, PAUSED, CLOSED, EXPIRED
    }
}
