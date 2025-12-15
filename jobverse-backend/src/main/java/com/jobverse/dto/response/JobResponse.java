package com.jobverse.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jobverse.entity.Job;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobResponse {
    
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String requirements;
    private String responsibilities;
    
    private CompanyInfo company;
    private CategoryInfo category;
    
    private Job.JobType jobType;
    private Job.ExperienceLevel experienceLevel;
    
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private Boolean salaryNegotiable;
    private String currency;
    private String salaryDisplay;
    
    private String location;
    private Boolean isRemote;
    private Job.RemoteType remoteType;
    
    private Integer positionsCount;
    private LocalDate deadline;
    private Job.JobStatus status;
    
    private Boolean isFeatured;
    private Boolean isUrgent;
    private String videoIntroUrl;
    
    private Integer viewCount;
    private Integer applicationCount;
    
    private List<SkillInfo> skills;
    private List<BenefitInfo> benefits;
    
    // AI Matching
    private Integer matchScore;
    private MatchAnalysis matchAnalysis;
    
    // User interaction
    private Boolean isSaved;
    private Boolean hasApplied;
    
    private LocalDateTime createdAt;
    private String postedTimeAgo;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyInfo {
        private Long id;
        private String name;
        private String slug;
        private String logoUrl;
        private String industry;
        private BigDecimal rating;
        private Integer reviewCount;
        private Boolean isVerified;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String slug;
        private String icon;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillInfo {
        private Long id;
        private String name;
        private String proficiency;
        private Boolean isRequired;
        private Boolean userHas; // For match analysis
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BenefitInfo {
        private String name;
        private String description;
        private String icon;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchAnalysis {
        private Integer skillMatch;
        private Integer experienceMatch;
        private Integer salaryMatch;
        private Integer locationMatch;
        private List<String> matchedSkills;
        private List<String> missingSkills;
        private List<String> recommendations;
    }
}
