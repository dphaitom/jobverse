package com.jobverse.service;

import com.jobverse.dto.response.CompanyResponse;
import com.jobverse.entity.Company;
import com.jobverse.entity.Job;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.repository.CompanyRepository;
import com.jobverse.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;

    public Page<CompanyResponse> getAllCompanies(Pageable pageable) {
        log.info("🏢 Fetching all companies with pagination: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<Company> companies = companyRepository.findAll(pageable);

        log.info("✅ Found {} companies", companies.getTotalElements());

        return companies.map(this::mapToResponse);
    }

    public CompanyResponse getCompanyById(Long id) {
        log.info("🔍 Fetching company by ID: {}", id);

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        return mapToDetailedResponse(company);
    }

    public CompanyResponse getCompanyBySlug(String slug) {
        log.info("🔍 Fetching company by slug: {}", slug);

        Company company = companyRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with slug: " + slug));

        return mapToDetailedResponse(company);
    }

    public List<CompanyResponse> getFeaturedCompanies() {
        log.info("⭐ Fetching featured companies");

        Pageable pageable = PageRequest.of(0, 12, Sort.by("createdAt").descending());
        List<Company> companies = companyRepository.findFeaturedCompanies(pageable);

        log.info("✅ Found {} featured companies", companies.size());

        return companies.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<CompanyResponse> getTopRatedCompanies(Pageable pageable) {
        log.info("🌟 Fetching top rated companies");

        Page<Company> companies = companyRepository.findTopRatedCompanies(pageable);

        log.info("✅ Found {} top rated companies", companies.getTotalElements());

        return companies.map(this::mapToResponse);
    }

    private CompanyResponse mapToResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .slug(company.getSlug())
                .logoUrl(company.getLogoUrl())
                .coverUrl(company.getCoverUrl())
                .description(company.getDescription())
                .industry(company.getIndustry())
                .companySize(company.getCompanySize())
                .foundedYear(company.getFoundedYear())
                .website(company.getWebsite())
                .headquarters(company.getHeadquarters())
                .verificationStatus(company.getVerificationStatus())
                .ratingAvg(company.getRatingAvg())
                .reviewCount(company.getReviewCount())
                .employeeCount(company.getEmployeeCount())
                .isFeatured(company.getIsFeatured())
                .createdAt(company.getCreatedAt())
                .activeJobCount(countActiveJobs(company))
                .build();
    }

    private CompanyResponse mapToDetailedResponse(Company company) {
        CompanyResponse response = mapToResponse(company);

        // Add owner info
        if (company.getOwner() != null) {
            response.setOwner(CompanyResponse.OwnerInfo.builder()
                    .id(company.getOwner().getId())
                    .email(company.getOwner().getEmail())
                    .build());
        }

        // Add images
        if (company.getImages() != null && !company.getImages().isEmpty()) {
            response.setImages(company.getImages().stream()
                    .map(img -> img.getImageUrl())
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private Integer countActiveJobs(Company company) {
        // Use repository query instead of accessing lazy collection
        return jobRepository.countByCompanyIdAndStatus(company.getId(), Job.JobStatus.ACTIVE);
    }
}
