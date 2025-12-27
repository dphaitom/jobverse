package com.jobverse.dto.request;

import com.jobverse.entity.Job;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {
    
    @NotBlank(message = "Job title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(min = 100, message = "Description must be at least 100 characters")
    private String description;
    
    private String requirements;
    
    private String responsibilities;
    
    // CompanyId is optional - if not provided, will use employer's company
    private Long companyId;
    
    private Long categoryId;
    
    @NotNull(message = "Job type is required")
    private Job.JobType jobType;
    
    @NotNull(message = "Experience level is required")
    private Job.ExperienceLevel experienceLevel;
    
    @DecimalMin(value = "0", message = "Minimum salary must be positive")
    private BigDecimal salaryMin;
    
    @DecimalMin(value = "0", message = "Maximum salary must be positive")
    private BigDecimal salaryMax;
    
    private Boolean salaryNegotiable;
    
    @Builder.Default
    private String currency = "VND";
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private Boolean isRemote;
    
    private Job.RemoteType remoteType;
    
    @Min(value = 1, message = "At least 1 position required")
    @Builder.Default
    private Integer positionsCount = 1;
    
    @Future(message = "Deadline must be in the future")
    private LocalDate deadline;
    
    private Boolean isFeatured;
    
    private Boolean isUrgent;
    
    private String videoIntroUrl;
    
    private List<JobSkillRequest> skills;
    
    private List<JobBenefitRequest> benefits;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobSkillRequest {
        private Long skillId;
        private String skillName; // For creating new skills
        private String proficiency;
        private Boolean isRequired;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobBenefitRequest {
        private String benefitName;
        private String description;
        private String icon;
    }
}
