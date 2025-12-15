// File: src/main/java/com/jobverse/dto/request/UpdateApplicationStatusRequest.java

package com.jobverse.dto.request;

import com.jobverse.entity.Application;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateApplicationStatusRequest {
    
    @NotNull(message = "Status is required")
    private Application.Status status;
    
    private String employerNote; // Ghi chú của nhà tuyển dụng
    
    private LocalDateTime interviewDate; // Ngày phỏng vấn (nếu status = INTERVIEW)
    
    private String interviewLocation; // Địa điểm phỏng vấn
    
    private String interviewNote; // Ghi chú phỏng vấn
}
