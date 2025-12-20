package com.jobverse.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.jobverse.dto.response.AuthResponse;
import com.jobverse.entity.User;
import com.jobverse.entity.UserProfile;
import com.jobverse.exception.BadRequestException;
import com.jobverse.repository.UserRepository;
import com.jobverse.security.JwtTokenProvider;
import com.jobverse.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Transactional
    public AuthResponse authenticateWithGoogle(String credential) {
        try {
            // Verify Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();

            GoogleIdToken idToken = verifier.verify(credential);

            if (idToken == null) {
                throw new BadRequestException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            // Extract user info
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            String googleId = payload.getSubject();

            log.info("Google OAuth: email={}, name={}, googleId={}", email, name, googleId);

            // Find or create user
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createGoogleUser(email, name, picture, googleId));

            // If user exists but not linked to Google, link it
            if (user.getOauthProvider() == null) {
                user.setOauthProvider("GOOGLE");
                user.setOauthId(googleId);
                user.setEmailVerified(true); // Google emails are verified
                user = userRepository.save(user);
            }

            // Generate JWT tokens
            return generateAuthResponse(user);

        } catch (Exception e) {
            log.error("Google OAuth error", e);
            throw new BadRequestException("Failed to authenticate with Google: " + e.getMessage());
        }
    }

    private User createGoogleUser(String email, String name, String picture, String googleId) {
        log.info("Creating new Google user: {}", email);

        User user = User.builder()
                .email(email)
                .passwordHash(null) // No password for OAuth users
                .role(User.Role.CANDIDATE)
                .status(User.Status.ACTIVE)
                .emailVerified(true) // Google emails are pre-verified
                .oauthProvider("GOOGLE")
                .oauthId(googleId)
                .build();

        // Create profile
        UserProfile profile = UserProfile.builder()
                .user(user)
                .fullName(name)
                .avatarUrl(picture)
                .build();
        user.setProfile(profile);

        return userRepository.save(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        UserPrincipal userPrincipal = UserPrincipal.create(user);

        String accessToken = tokenProvider.generateToken(
                new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities())
        );
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L) // 24 hours
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getProfile() != null ? user.getProfile().getFullName() : null)
                        .avatarUrl(user.getProfile() != null ? user.getProfile().getAvatarUrl() : null)
                        .role(user.getRole())
                        .build())
                .build();
    }
}
