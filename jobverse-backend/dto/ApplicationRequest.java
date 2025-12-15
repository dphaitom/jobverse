// ==================== APPLICATION DTOs ====================
// File: src/main/java/com/jobverse/dto/request/ApplicationRequest.java

package com.jobverse.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationRequest {
    
    @NotNull(message = "Job ID is required")
    private Long jobId;
    
    private Long resumeId; // Optional - CV đã upload
    
    private String coverLetter; // Thư giới thiệu
    
    private String expectedSalary; // Mức lương mong muốn
    
    private String availableDate; // Ngày có thể bắt đầu
}
