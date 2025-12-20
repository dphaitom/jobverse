package com.jobverse.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyReviewRequest {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Pros are required")
    @Size(max = 2000, message = "Pros must not exceed 2000 characters")
    private String pros;

    @Size(max = 2000, message = "Cons must not exceed 2000 characters")
    private String cons;

    private Boolean isCurrentEmployee;

    @Size(max = 100, message = "Job title must not exceed 100 characters")
    private String jobTitle;
}
