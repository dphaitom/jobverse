package com.jobverse.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jobverse.entity.Company;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanyResponse {

    private Long id;
    private String name;
    private String slug;
    private String logoUrl;
    private String coverUrl;
    private String description;
    private String industry;
    private Company.CompanySize companySize;
    private Integer foundedYear;
    private String website;
    private String headquarters;
    private Company.VerificationStatus verificationStatus;
    private BigDecimal ratingAvg;
    private Integer reviewCount;
    private Integer employeeCount;
    private Boolean isFeatured;
    private LocalDateTime createdAt;

    // Additional info
    private Integer activeJobCount;
    private List<String> images;
    private OwnerInfo owner;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerInfo {
        private Long id;
        private String email;
        private String fullName;
    }
}
