package com.jobverse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String slug;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @Column(name = "is_trending")
    @Builder.Default
    private Boolean isTrending = false;
    
    @Column(name = "job_count")
    @Builder.Default
    private Integer jobCount = 0;
    
    @Column(name = "candidate_count")
    @Builder.Default
    private Integer candidateCount = 0;
}
