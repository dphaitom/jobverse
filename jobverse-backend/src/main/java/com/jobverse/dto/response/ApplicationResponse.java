package com.jobverse.dto.response;

import com.jobverse.entity.Application;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long companyId;
    private String companyName;
    private String companyLogo;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long resumeId;
    private String resumeTitle;
    private String coverLetter;
    private BigDecimal expectedSalary;
    private Application.ApplicationStatus status;
    private Integer aiMatchScore;
    private String rejectionReason;
    private Boolean isQuickApply;
    private Boolean isAnonymous;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime viewedAt;

    public static ApplicationResponse fromEntity(Application application) {
        ApplicationResponseBuilder builder = ApplicationResponse.builder()
                .id(application.getId())
                .coverLetter(application.getCoverLetter())
                .expectedSalary(application.getExpectedSalary())
                .status(application.getStatus())
                .aiMatchScore(application.getAiMatchScore())
                .rejectionReason(application.getRejectionReason())
                .isQuickApply(application.getIsQuickApply())
                .isAnonymous(application.getIsAnonymous())
                .appliedAt(application.getAppliedAt())
                .updatedAt(application.getUpdatedAt())
                .viewedAt(application.getViewedAt());

        // Safely get job info
        if (application.getJob() != null) {
            builder.jobId(application.getJob().getId())
                   .jobTitle(application.getJob().getTitle());

            // Safely get company info
            if (application.getJob().getCompany() != null) {
                builder.companyId(application.getJob().getCompany().getId())
                       .companyName(application.getJob().getCompany().getName())
                       .companyLogo(application.getJob().getCompany().getLogoUrl());
            }
        }

        // Safely get user info
        if (application.getUser() != null) {
            builder.userId(application.getUser().getId())
                   .userEmail(application.getUser().getEmail());

            // Get full name from profile if available
            if (application.getUser().getProfile() != null) {
                builder.userFullName(application.getUser().getProfile().getFullName());
            }
        }

        // Safely get resume info
        if (application.getResume() != null) {
            builder.resumeId(application.getResume().getId())
                   .resumeTitle(application.getResume().getTitle());
        }

        return builder.build();
    }
}
