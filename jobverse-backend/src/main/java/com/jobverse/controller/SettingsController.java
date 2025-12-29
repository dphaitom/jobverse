package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "Application settings and configuration APIs")
public class SettingsController {

    @GetMapping("/theme")
    @Operation(summary = "Get theme configuration for light and dark mode")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getThemeConfig() {
        Map<String, Object> themeConfig = new HashMap<>();

        // Light mode configuration
        Map<String, String> lightMode = new HashMap<>();
        lightMode.put("background", "#ffffff");
        lightMode.put("backgroundSecondary", "#f8f9fa");
        lightMode.put("sidebar", "#e9ecef");
        lightMode.put("header", "#f1f3f5");
        lightMode.put("footer", "#e9ecef");
        lightMode.put("text", "#212529");
        lightMode.put("textSecondary", "#495057");
        lightMode.put("border", "#dee2e6");
        lightMode.put("primary", "#7c3aed");
        lightMode.put("primaryHover", "#6d28d9");
        lightMode.put("card", "#ffffff");
        lightMode.put("cardHover", "#f8f9fa");
        lightMode.put("input", "#ffffff");
        lightMode.put("inputBorder", "#ced4da");

        // Dark mode configuration
        Map<String, String> darkMode = new HashMap<>();
        darkMode.put("background", "#0a0a0b");
        darkMode.put("backgroundSecondary", "#121214");
        darkMode.put("sidebar", "#18181b");
        darkMode.put("header", "#18181b");
        darkMode.put("footer", "#18181b");
        darkMode.put("text", "#f4f4f5");
        darkMode.put("textSecondary", "#a1a1aa");
        darkMode.put("border", "#27272a");
        darkMode.put("primary", "#8b5cf6");
        darkMode.put("primaryHover", "#7c3aed");
        darkMode.put("card", "#18181b");
        darkMode.put("cardHover", "#27272a");
        darkMode.put("input", "#27272a");
        darkMode.put("inputBorder", "#3f3f46");

        themeConfig.put("light", lightMode);
        themeConfig.put("dark", darkMode);

        // Default theme
        themeConfig.put("defaultTheme", "dark");

        return ResponseEntity.ok(ApiResponse.success("Theme configuration retrieved", themeConfig));
    }

    @GetMapping("/ui-config")
    @Operation(summary = "Get UI configuration")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUIConfig() {
        Map<String, Object> uiConfig = new HashMap<>();

        // Feature flags
        Map<String, Boolean> features = new HashMap<>();
        features.put("aiResume", true);
        features.put("aiInterview", true);
        features.put("aiCVRanking", true);
        features.put("messaging", true);
        features.put("notifications", true);
        features.put("companyReviews", true);
        features.put("salaryInsights", true);

        // Pagination settings
        Map<String, Integer> pagination = new HashMap<>();
        pagination.put("defaultPageSize", 20);
        pagination.put("maxPageSize", 100);

        // File upload limits
        Map<String, Object> fileUpload = new HashMap<>();
        fileUpload.put("maxAvatarSize", 5 * 1024 * 1024); // 5MB
        fileUpload.put("maxResumeSize", 10 * 1024 * 1024); // 10MB
        fileUpload.put("allowedImageTypes", new String[]{"image/jpeg", "image/png", "image/gif", "image/webp"});
        fileUpload.put("allowedResumeTypes", new String[]{"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"});

        uiConfig.put("features", features);
        uiConfig.put("pagination", pagination);
        uiConfig.put("fileUpload", fileUpload);

        return ResponseEntity.ok(ApiResponse.success("UI configuration retrieved", uiConfig));
    }
}
