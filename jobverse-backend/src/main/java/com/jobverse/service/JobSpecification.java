package com.jobverse.service;

import com.jobverse.entity.Job;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class JobSpecification {
    
    public static Specification<Job> hasStatus(Job.JobStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }
    
    public static Specification<Job> containsKeyword(String keyword) {
        return (root, query, cb) -> {
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("company").get("name")), pattern)
            );
        };
    }
    
    public static Specification<Job> hasLocation(String location) {
        return (root, query, cb) -> 
                cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
    }
    
    public static Specification<Job> hasCategory(Long categoryId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }
    
    public static Specification<Job> hasJobType(Job.JobType jobType) {
        return (root, query, cb) -> cb.equal(root.get("jobType"), jobType);
    }
    
    public static Specification<Job> hasExperienceLevel(Job.ExperienceLevel level) {
        return (root, query, cb) -> cb.equal(root.get("experienceLevel"), level);
    }
    
    public static Specification<Job> hasSalaryMin(BigDecimal salaryMin) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("salaryMax"), salaryMin);
    }
    
    public static Specification<Job> hasSalaryMax(BigDecimal salaryMax) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("salaryMin"), salaryMax);
    }
    
    public static Specification<Job> isRemote() {
        return (root, query, cb) -> cb.isTrue(root.get("isRemote"));
    }
    
    public static Specification<Job> isFeatured() {
        return (root, query, cb) -> cb.isTrue(root.get("isFeatured"));
    }
    
    public static Specification<Job> isUrgent() {
        return (root, query, cb) -> cb.isTrue(root.get("isUrgent"));
    }
    
    public static Specification<Job> belongsToCompany(Long companyId) {
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }
}
