package com.jobverse.repository;

import com.jobverse.entity.Company;
import com.jobverse.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    
    Optional<Company> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    
    boolean existsByName(String name);
    
    // Returns single company for employer (1:1 relationship)
    Optional<Company> findByOwnerId(Long ownerId);
    
    Optional<Company> findByOwner(User owner);
    
    boolean existsByOwnerId(Long ownerId);
    
    @Query("SELECT c FROM Company c WHERE c.verificationStatus = 'VERIFIED' ORDER BY c.ratingAvg DESC")
    Page<Company> findTopRatedCompanies(Pageable pageable);
    
    @Query("SELECT c FROM Company c WHERE c.isFeatured = true AND c.verificationStatus = 'VERIFIED'")
    List<Company> findFeaturedCompanies(Pageable pageable);
    
    @Query("SELECT c FROM Company c WHERE c.verificationStatus = 'PENDING'")
    Page<Company> findPendingVerification(Pageable pageable);
}
