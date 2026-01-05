package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.CompanyResponse;
import com.jobverse.dto.response.JobResponse;
import com.jobverse.entity.Job;
import com.jobverse.repository.JobRepository;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v1/companies")
@RequiredArgsConstructor
@Tag(name = "Companies", description = "Company management APIs")
public class CompanyController {

    private final CompanyService companyService;
    private final JobRepository jobRepository;

    @GetMapping
    @Operation(summary = "Get all companies with pagination and optional search")
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getAllCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String industry,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("📋 GET /v1/companies - keyword={}, industry={}, page={}, size={}", 
                keyword, industry, pageable.getPageNumber(), pageable.getPageSize());

        Page<CompanyResponse> companies;
        
        // Use search if filters provided, otherwise get all
        if ((keyword != null && !keyword.trim().isEmpty()) || (industry != null && !industry.trim().isEmpty())) {
            companies = companyService.searchCompanies(keyword, industry, pageable);
        } else {
            companies = companyService.getAllCompanies(pageable);
        }

        log.info("✅ Returning {} companies (total: {})", companies.getNumberOfElements(), companies.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    @Operation(summary = "Get companies owned by current employer")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getMyCompanies(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("🏢 GET /v1/companies/my - employer={}", currentUser.getId());

        List<CompanyResponse> companies = companyService.getCompaniesByOwnerId(currentUser.getId());

        log.info("✅ Returning {} companies for employer {}", companies.size(), currentUser.getId());

        return ResponseEntity.ok(ApiResponse.success("My companies retrieved", companies));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company details by ID")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(
            @PathVariable Long id
    ) {
        log.info("🔍 GET /v1/companies/{}", id);

        CompanyResponse company = companyService.getCompanyById(id);

        return ResponseEntity.ok(ApiResponse.success(company));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get company details by slug")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyBySlug(
            @PathVariable String slug
    ) {
        log.info("🔍 GET /v1/companies/slug/{}", slug);

        CompanyResponse company = companyService.getCompanyBySlug(slug);

        return ResponseEntity.ok(ApiResponse.success(company));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured companies")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getFeaturedCompanies() {
        log.info("⭐ GET /v1/companies/featured");

        List<CompanyResponse> companies = companyService.getFeaturedCompanies();

        log.info("✅ Returning {} featured companies", companies.size());

        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated companies")
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getTopRatedCompanies(
            @PageableDefault(size = 12, sort = "ratingAvg", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("🌟 GET /v1/companies/top-rated");

        Page<CompanyResponse> companies = companyService.getTopRatedCompanies(pageable);

        log.info("✅ Returning {} top rated companies", companies.getNumberOfElements());

        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    @GetMapping("/{id}/jobs")
    @Operation(summary = "Get jobs by company ID")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getJobsByCompany(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("💼 GET /v1/companies/{}/jobs", id);

        Page<Job> jobs = jobRepository.findByCompanyIdAndStatus(id, Job.JobStatus.ACTIVE, pageable);
        Page<JobResponse> jobResponses = jobs.map(job -> JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .slug(job.getSlug())
                .description(job.getDescription())
                .location(job.getLocation())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryNegotiable(job.getSalaryNegotiable())
                .currency(job.getCurrency())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .deadline(job.getDeadline())
                .isFeatured(job.getIsFeatured())
                .isRemote(job.getIsRemote())
                .isUrgent(job.getIsUrgent())
                .positionsCount(job.getPositionsCount())
                .status(job.getStatus())
                .createdAt(job.getCreatedAt())
                .build());

        log.info("✅ Returning {} jobs for company {}", jobResponses.getNumberOfElements(), id);

        return ResponseEntity.ok(ApiResponse.success(jobResponses));
    }
}
