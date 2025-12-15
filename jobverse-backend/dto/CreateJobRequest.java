// File: src/main/java/com/jobverse/dto/request/CreateJobRequest.java

package com.jobverse.dto.request;

import com.jobverse.entity.Job;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateJobRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be less than 200 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String requirements;
    
    private String responsibilities;
    
    private String benefits;
    
    @NotNull(message = "Job type is required")
    private Job.JobType jobType; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
    
    @NotNull(message = "Experience level is required")
    private Job.ExperienceLevel experienceLevel; // ENTRY, JUNIOR, MID, SENIOR, LEAD
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private boolean isRemote;
    
    private Long salaryMin;
    
    private Long salaryMax;
    
    private String salaryCurrency = "VND";
    
    private boolean salaryNegotiable;
    
    private Long categoryId;
    
    private List<Long> skillIds;
    
    private List<String> newSkills; // Skills mới chưa có trong DB
    
    private Integer positionsCount = 1; // Số lượng tuyển
    
    private LocalDate deadline; // Hạn nộp hồ sơ
    
    private boolean isUrgent;
    
    private boolean isFeatured;
}
