package com.jobverse.repository;

import com.jobverse.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    Optional<Job> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT DISTINCT j FROM Job j " +
           "LEFT JOIN FETCH j.company " +
           "LEFT JOIN FETCH j.category " +
           "WHERE j.status = 'ACTIVE'")
    List<Job> findAllActiveWithDetails(Pageable pageable);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = 'ACTIVE'")
    long countActiveJobsForPage();
    
    @Query("SELECT j FROM Job j " +
           "LEFT JOIN FETCH j.company " +
           "LEFT JOIN FETCH j.skills js " +
           "LEFT JOIN FETCH js.skill " +
           "WHERE j.id = :id")
    Optional<Job> findByIdWithDetails(Long id);
    
    @Query("SELECT j FROM Job j WHERE j.status = :status ORDER BY j.createdAt DESC")
    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE j.company.id = :companyId AND j.status = :status")
    Page<Job> findByCompanyIdAndStatus(Long companyId, Job.JobStatus status, Pageable pageable);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.company.id = :companyId AND j.status = :status")
    Integer countByCompanyIdAndStatus(Long companyId, Job.JobStatus status);

    @Query("SELECT j FROM Job j WHERE j.isFeatured = true AND j.status = 'ACTIVE' ORDER BY j.createdAt DESC")
    List<Job> findFeaturedJobs(Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE j.isUrgent = true AND j.status = 'ACTIVE' ORDER BY j.createdAt DESC")
    List<Job> findUrgentJobs(Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE j.category.id = :categoryId AND j.status = 'ACTIVE'")
    Page<Job> findByCategoryId(Long categoryId, Pageable pageable);
    
    @Query(value = "SELECT j.* FROM jobs j " +
                   "JOIN job_skills js ON j.id = js.job_id " +
                   "WHERE js.skill_id IN :skillIds AND j.status = 'ACTIVE' " +
                   "GROUP BY j.id " +
                   "ORDER BY COUNT(js.skill_id) DESC",
           nativeQuery = true)
    Page<Job> findBySkillIds(@Param("skillIds") List<Long> skillIds, Pageable pageable);
    
    @Modifying
    @Query("UPDATE Job j SET j.viewCount = j.viewCount + 1 WHERE j.id = :id")
    void incrementViewCount(Long id);
    
    @Modifying
    @Query("UPDATE Job j SET j.applicationCount = j.applicationCount + 1 WHERE j.id = :id")
    void incrementApplicationCount(Long id);
    
    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = 'ACTIVE'")
    long countActiveJobs();
    
    @Query("SELECT j.location, COUNT(j) FROM Job j WHERE j.status = 'ACTIVE' GROUP BY j.location ORDER BY COUNT(j) DESC")
    List<Object[]> countJobsByLocation();
}
