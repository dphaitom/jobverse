package com.jobverse.controller;

import com.jobverse.dto.request.GoogleTokenRequest;
import com.jobverse.dto.response.ApiResponse;
import com.jobverse.dto.response.AuthResponse;
import com.jobverse.service.GoogleOAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/v1/auth/oauth")
@RequiredArgsConstructor
@Tag(name = "OAuth Authentication", description = "OAuth2 authentication APIs")
public class OAuthController {

    private final GoogleOAuthService googleOAuthService;

    @PostMapping("/google")
    @Operation(summary = "Authenticate with Google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody GoogleTokenRequest request
    ) {
        log.info("🔐 Google OAuth login attempt");

        AuthResponse response = googleOAuthService.authenticateWithGoogle(request.getCredential());

        log.info("✅ Google OAuth successful: {}", response.getUser().getEmail());

        return ResponseEntity.ok(ApiResponse.success("Google authentication successful", response));
    }
}
