package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.SkillResponse;
import com.jobverse.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v1/skills")
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Skill management APIs")
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    @Operation(summary = "Get all skills")
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getAllSkills() {
        log.info("📋 GET /v1/skills");

        List<SkillResponse> skills = skillService.getAllSkills();

        log.info("✅ Returning {} skills", skills.size());

        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending skills")
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getTrendingSkills() {
        log.info("🔥 GET /v1/skills/trending");

        List<SkillResponse> skills = skillService.getTrendingSkills();

        log.info("✅ Returning {} trending skills", skills.size());

        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill by ID")
    public ResponseEntity<ApiResponse<SkillResponse>> getSkillById(
            @PathVariable Long id
    ) {
        log.info("🔍 GET /v1/skills/{}", id);

        SkillResponse skill = skillService.getSkillById(id);

        return ResponseEntity.ok(ApiResponse.success(skill));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get skill by slug")
    public ResponseEntity<ApiResponse<SkillResponse>> getSkillBySlug(
            @PathVariable String slug
    ) {
        log.info("🔍 GET /v1/skills/slug/{}", slug);

        SkillResponse skill = skillService.getSkillBySlug(slug);

        return ResponseEntity.ok(ApiResponse.success(skill));
    }
}
