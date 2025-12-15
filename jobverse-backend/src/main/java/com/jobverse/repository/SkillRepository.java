package com.jobverse.repository;

import com.jobverse.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    
    Optional<Skill> findBySlug(String slug);
    
    Optional<Skill> findByNameIgnoreCase(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT s FROM Skill s WHERE s.isTrending = true ORDER BY s.jobCount DESC")
    List<Skill> findTrendingSkills();
    
    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Skill> searchByName(String query);
    
    @Query("SELECT s FROM Skill s WHERE s.category.id = :categoryId")
    List<Skill> findByCategoryId(Long categoryId);
}
