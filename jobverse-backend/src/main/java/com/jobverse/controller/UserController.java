package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.entity.User;
import com.jobverse.entity.UserProfile;
import com.jobverse.repository.UserProfileRepository;
import com.jobverse.repository.UserRepository;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User Management APIs")
public class UserController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final FileStorageService fileStorageService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(
            @CurrentUser UserPrincipal currentUser
    ) {
        log.info("📋 Getting profile for user: {}", currentUser.getEmail());

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = user.getProfile();
        if (profile == null) {
            log.info("📝 No profile found for user {}, creating new profile", user.getId());
            profile = UserProfile.builder()
                    .user(user)
                    .fullName(user.getEmail().split("@")[0]) // Default name from email
                    .openToWork(true)
                    .openToRemote(true)
                    .build();
            profile = userProfileRepository.save(profile);
            user.setProfile(profile);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole().toString());
        response.put("emailVerified", user.getEmailVerified());
        response.put("createdAt", user.getCreatedAt());

        // Profile data
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("fullName", profile.getFullName());
        profileData.put("avatarUrl", profile.getAvatarUrl());
        profileData.put("city", profile.getCity());
        profileData.put("bio", profile.getBio());
        profileData.put("linkedinUrl", profile.getLinkedinUrl());
        profileData.put("githubUrl", profile.getGithubUrl());
        profileData.put("portfolioUrl", profile.getPortfolioUrl());
        profileData.put("experienceYears", profile.getExperienceYears());
        profileData.put("currentPosition", profile.getCurrentPosition());
        profileData.put("openToWork", profile.getOpenToWork());
        profileData.put("openToRemote", profile.getOpenToRemote());

        response.put("profile", profileData);

        log.info("✅ Profile retrieved successfully for user: {}", user.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", response));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCurrentUser(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, Object> updates
    ) {
        log.info("🔄 Updating profile for user: {}", currentUser.getEmail());
        log.debug("📦 Received updates: {}", updates);

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = user.getProfile();
        if (profile == null) {
            log.info("📝 Creating new profile for user {}", user.getId());
            profile = UserProfile.builder()
                    .user(user)
                    .build();
        }

        // Update phone on User entity
        if (updates.containsKey("phone")) {
            String phone = (String) updates.get("phone");
            log.debug("📞 Updating phone: {}", phone);
            user.setPhone(phone);
        }

        // Update profile fields
        if (updates.containsKey("fullName")) {
            String fullName = (String) updates.get("fullName");
            log.debug("👤 Updating fullName: {}", fullName);
            profile.setFullName(fullName);
        }

        if (updates.containsKey("city")) {
            profile.setCity((String) updates.get("city"));
        }

        if (updates.containsKey("bio")) {
            profile.setBio((String) updates.get("bio"));
        }

        if (updates.containsKey("currentPosition")) {
            profile.setCurrentPosition((String) updates.get("currentPosition"));
        }

        if (updates.containsKey("experienceYears")) {
            Object expYears = updates.get("experienceYears");
            if (expYears instanceof Integer) {
                profile.setExperienceYears((Integer) expYears);
            } else if (expYears instanceof String) {
                try {
                    profile.setExperienceYears(Integer.parseInt((String) expYears));
                } catch (NumberFormatException e) {
                    log.warn("⚠️ Invalid experienceYears format: {}", expYears);
                }
            }
        }

        if (updates.containsKey("linkedinUrl")) {
            profile.setLinkedinUrl((String) updates.get("linkedinUrl"));
        }

        if (updates.containsKey("githubUrl")) {
            profile.setGithubUrl((String) updates.get("githubUrl"));
        }

        if (updates.containsKey("portfolioUrl")) {
            profile.setPortfolioUrl((String) updates.get("portfolioUrl"));
        }

        if (updates.containsKey("openToWork")) {
            profile.setOpenToWork((Boolean) updates.get("openToWork"));
        }

        if (updates.containsKey("openToRemote")) {
            profile.setOpenToRemote((Boolean) updates.get("openToRemote"));
        }

        if (updates.containsKey("avatarUrl")) {
            profile.setAvatarUrl((String) updates.get("avatarUrl"));
        }

        // Save changes
        try {
            log.info("💾 Saving user and profile...");
            userRepository.save(user);
            UserProfile savedProfile = userProfileRepository.save(profile);
            user.setProfile(savedProfile);

            log.info("✅ Profile updated successfully for user: {}", user.getEmail());

            // Return updated data
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("phone", user.getPhone());
            response.put("role", user.getRole().toString());

            Map<String, Object> profileData = new HashMap<>();
            profileData.put("fullName", savedProfile.getFullName());
            profileData.put("avatarUrl", savedProfile.getAvatarUrl());
            profileData.put("city", savedProfile.getCity());
            profileData.put("bio", savedProfile.getBio());
            profileData.put("currentPosition", savedProfile.getCurrentPosition());
            profileData.put("experienceYears", savedProfile.getExperienceYears());
            profileData.put("linkedinUrl", savedProfile.getLinkedinUrl());
            profileData.put("githubUrl", savedProfile.getGithubUrl());
            profileData.put("portfolioUrl", savedProfile.getPortfolioUrl());
            profileData.put("openToWork", savedProfile.getOpenToWork());
            profileData.put("openToRemote", savedProfile.getOpenToRemote());

            response.put("profile", profileData);

            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));

        } catch (Exception e) {
            log.error("❌ Error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("UPDATE_FAILED", "Failed to update profile: " + e.getMessage()));
        }
    }

    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload user avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file
    ) {
        log.info("📸 Uploading avatar for user: {}", currentUser.getEmail());

        try {
            // Store file
            String avatarUrl = fileStorageService.storeFile(file, "avatars");

            // Update user profile
            User user = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserProfile profile = user.getProfile();
            if (profile == null) {
                profile = UserProfile.builder()
                        .user(user)
                        .fullName(user.getEmail().split("@")[0])
                        .build();
            }

            // Delete old avatar if exists
            if (profile.getAvatarUrl() != null) {
                fileStorageService.deleteFile(profile.getAvatarUrl());
            }

            profile.setAvatarUrl(avatarUrl);
            userProfileRepository.save(profile);

            log.info("✅ Avatar uploaded successfully: {}", avatarUrl);

            Map<String, String> response = new HashMap<>();
            response.put("avatarUrl", avatarUrl);

            return ResponseEntity.ok(ApiResponse.success("Avatar uploaded successfully", response));
        } catch (Exception e) {
            log.error("❌ Error uploading avatar: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("UPLOAD_FAILED", "Failed to upload avatar: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}/public-profile")
    @Operation(summary = "Get public user profile", description = "Get publicly visible profile information for a user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicProfile(
            @PathVariable Long userId
    ) {
        log.info("📋 Getting public profile for user ID: {}", userId);

        User user = userRepository.findByIdWithProfile(userId).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("NOT_FOUND", "User not found"));
        }

        UserProfile profile = user.getProfile();
        
        // Build public profile response (only public information)
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        
        if (profile != null) {
            response.put("fullName", profile.getFullName() != null ? profile.getFullName() : user.getEmail().split("@")[0]);
            response.put("avatarUrl", profile.getAvatarUrl());
            response.put("city", profile.getCity());
            response.put("bio", profile.getBio());
            response.put("currentPosition", profile.getCurrentPosition());
            response.put("experienceYears", profile.getExperienceYears());
            response.put("linkedinUrl", profile.getLinkedinUrl());
            response.put("githubUrl", profile.getGithubUrl());
            response.put("portfolioUrl", profile.getPortfolioUrl());
            response.put("openToWork", profile.getOpenToWork());
            response.put("openToRemote", profile.getOpenToRemote());
        } else {
            response.put("fullName", user.getEmail().split("@")[0]);
            response.put("avatarUrl", null);
        }

        log.info("✅ Public profile retrieved for user ID: {}", userId);
        return ResponseEntity.ok(ApiResponse.success("Public profile retrieved", response));
    }
}
