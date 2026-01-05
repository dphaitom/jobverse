package com.jobverse.service;

import com.jobverse.dto.response.SkillResponse;
import com.jobverse.entity.Skill;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SkillService {

    private final SkillRepository skillRepository;

    public List<SkillResponse> getAllSkills() {
        log.info("📋 Fetching all skills");

        List<Skill> skills = skillRepository.findAll(Sort.by("name"));

        log.info("✅ Found {} skills", skills.size());

        return skills.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SkillResponse> getTrendingSkills() {
        log.info("🔥 Fetching trending skills");

        List<Skill> skills = skillRepository.findTrendingSkills();
        
        // If no skills have isTrending flag, fall back to top skills by job count
        if (skills.isEmpty()) {
            log.info("No trending skills found, falling back to top skills by job count");
            skills = skillRepository.findTopSkillsByJobCount();
            // Limit to top 10
            if (skills.size() > 10) {
                skills = skills.subList(0, 10);
            }
        }

        log.info("✅ Found {} trending skills", skills.size());

        return skills.stream()
                .map(skill -> mapToResponseWithJobCount(skill))
                .collect(Collectors.toList());
    }

    public SkillResponse getSkillById(Long id) {
        log.info("🔍 Fetching skill by ID: {}", id);

        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));

        return mapToResponse(skill);
    }

    public SkillResponse getSkillBySlug(String slug) {
        log.info("🔍 Fetching skill by slug: {}", slug);

        Skill skill = skillRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with slug: " + slug));

        return mapToResponse(skill);
    }

    private SkillResponse mapToResponse(Skill skill) {
        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .slug(skill.getSlug())
                .isTrending(skill.getIsTrending())
                .jobCount(skill.getJobCount())
                .candidateCount(skill.getCandidateCount())
                .build();
    }
    
    // Map to response with dynamic job count from database
    private SkillResponse mapToResponseWithJobCount(Skill skill) {
        Integer actualJobCount = skillRepository.countActiveJobsBySkillId(skill.getId());
        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .slug(skill.getSlug())
                .isTrending(actualJobCount != null && actualJobCount > 0)
                .jobCount(actualJobCount != null ? actualJobCount : 0)
                .candidateCount(skill.getCandidateCount())
                .build();
    }
}
