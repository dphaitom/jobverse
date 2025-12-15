package com.jobverse.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {
    
    @NotNull(message = "Job ID is required")
    private Long jobId;
    
    private Long resumeId;
    
    @Size(max = 5000, message = "Cover letter must not exceed 5000 characters")
    private String coverLetter;
    
    @DecimalMin(value = "0", message = "Expected salary must be positive")
    private BigDecimal expectedSalary;
}
