package com.jobverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    private String address;
    
    private String city;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "linkedin_url")
    private String linkedinUrl;
    
    @Column(name = "github_url")
    private String githubUrl;
    
    @Column(name = "portfolio_url")
    private String portfolioUrl;
    
    @Column(name = "experience_years")
    private Integer experienceYears;
    
    @Column(name = "current_position")
    private String currentPosition;
    
    @Column(name = "expected_salary_min", precision = 15, scale = 2)
    private BigDecimal expectedSalaryMin;
    
    @Column(name = "expected_salary_max", precision = 15, scale = 2)
    private BigDecimal expectedSalaryMax;
    
    @Column(name = "open_to_work")
    @Builder.Default
    private Boolean openToWork = true;
    
    @Column(name = "open_to_remote")
    @Builder.Default
    private Boolean openToRemote = true;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum Gender {
        MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
    }
}
