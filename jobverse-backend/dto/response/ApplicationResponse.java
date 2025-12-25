// File: src/main/java/com/jobverse/dto/response/ApplicationResponse.java

package com.jobverse.dto.response;

import com.jobverse.entity.Application;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse {
    
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogo;
    private String location;
    private String salaryRange;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String candidateAvatar;
    private Long resumeId;
    private String resumeUrl;
    private String coverLetter;
    private String expectedSalary;
    private Application.Status status;
    private String employerNote;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime interviewDate;
    
    public static ApplicationResponse fromEntity(Application app) {
        ApplicationResponseBuilder builder = ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .location(app.getJob().getLocation())
                .candidateId(app.getCandidate().getId())
                .candidateEmail(app.getCandidate().getEmail())
                .coverLetter(app.getCoverLetter())
                .expectedSalary(app.getExpectedSalary())
                .status(app.getStatus())
                .employerNote(app.getEmployerNote())
                .appliedAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .interviewDate(app.getInterviewDate());
        
        // Company info
        if (app.getJob().getCompany() != null) {
            builder.companyName(app.getJob().getCompany().getName())
                   .companyLogo(app.getJob().getCompany().getLogoUrl());
        }
        
        // Salary range
        if (app.getJob().getSalaryMin() != null && app.getJob().getSalaryMax() != null) {
            builder.salaryRange(String.format("%d - %d triệu", 
                app.getJob().getSalaryMin() / 1000000, 
                app.getJob().getSalaryMax() / 1000000));
        }
        
        // Candidate profile
        if (app.getCandidate().getProfile() != null) {
            builder.candidateName(app.getCandidate().getProfile().getFullName())
                   .candidatePhone(app.getCandidate().getPhone())
                   .candidateAvatar(app.getCandidate().getProfile().getAvatarUrl());
        }
        
        // Resume
        if (app.getResume() != null) {
            builder.resumeId(app.getResume().getId())
                   .resumeUrl(app.getResume().getFileUrl());
        }
        
        return builder.build();
    }
}
