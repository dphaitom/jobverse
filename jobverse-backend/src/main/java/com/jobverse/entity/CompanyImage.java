package com.jobverse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    
    @Column(name = "image_url", nullable = false)
    private String imageUrl;
    
    private String caption;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
