package com.jobverse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_benefits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobBenefit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @Column(name = "benefit_name", nullable = false)
    private String benefitName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String icon;
}
