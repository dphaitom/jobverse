package com.jobverse.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {
    
    // For candidate: must provide companyId
    // For employer: must provide candidateUserId
    private Long companyId;
    private Long candidateUserId;
    
    // Optional: link conversation to a specific job
    private Long jobId;
}
