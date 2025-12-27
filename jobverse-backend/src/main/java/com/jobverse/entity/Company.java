package com.jobverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 1:1 relationship - each company belongs to exactly one employer
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    private User owner;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String slug;
    
    @Column(name = "logo_url")
    private String logoUrl;
    
    @Column(name = "cover_url")
    private String coverUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String industry;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "company_size")
    private CompanySize companySize;
    
    @Column(name = "founded_year")
    private Integer foundedYear;
    
    private String website;
    
    private String headquarters;
    
    @Column(name = "tax_code", unique = true)
    private String taxCode;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    
    @Column(name = "rating_avg", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal ratingAvg = BigDecimal.ZERO;
    
    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;
    
    @Column(name = "employee_count")
    private Integer employeeCount;
    
    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Job> jobs = new HashSet<>();
    
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<CompanyImage> images = new HashSet<>();
    
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<CompanyReview> reviews = new HashSet<>();
    
    public enum CompanySize {
        STARTUP_1_10,
        SMALL_11_50,
        MEDIUM_51_200,
        LARGE_201_500,
        ENTERPRISE_501_1000,
        CORPORATION_1000_PLUS
    }
    
    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED
    }
}
