package com.jobverse.repository;

import com.jobverse.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    
    Optional<Skill> findBySlug(String slug);
    
    Optional<Skill> findByNameIgnoreCase(String name);
    
    boolean existsByName(String name);
    
    // Get trending skills - using simple query with isTrending flag first
    // Falls back to order by jobCount if no trending skills
    @Query("SELECT s FROM Skill s WHERE s.isTrending = true ORDER BY s.jobCount DESC")
    List<Skill> findTrendingSkills();
    
    // Get top skills by job count (alternative if no trending flags set)
    @Query("SELECT s FROM Skill s ORDER BY s.jobCount DESC")
    List<Skill> findTopSkillsByJobCount();
    
    // Count jobs for a specific skill using native query
    @Query(value = "SELECT COUNT(DISTINCT j.id) FROM jobs j " +
                   "JOIN job_skills js ON js.job_id = j.id " +
                   "WHERE js.skill_id = :skillId AND j.status = 'ACTIVE'", 
           nativeQuery = true)
    Integer countActiveJobsBySkillId(@Param("skillId") Long skillId);
    
    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Skill> searchByName(@Param("query") String query);
    
    @Query("SELECT s FROM Skill s WHERE s.category.id = :categoryId")
    List<Skill> findByCategoryId(@Param("categoryId") Long categoryId);
}
