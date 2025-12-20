package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.CompanyResponse;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v1/companies")
@RequiredArgsConstructor
@Tag(name = "Companies", description = "Company management APIs")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    @Operation(summary = "Get all companies with pagination")
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getAllCompanies(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("📋 GET /v1/companies - page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());

        Page<CompanyResponse> companies = companyService.getAllCompanies(pageable);

        log.info("✅ Returning {} companies (total: {})", companies.getNumberOfElements(), companies.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success(companies));
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
}
