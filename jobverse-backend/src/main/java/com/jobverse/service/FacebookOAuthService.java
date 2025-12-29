package com.jobverse.service;

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
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FacebookOAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String FACEBOOK_GRAPH_API = "https://graph.facebook.com/v18.0/me";

    @Value("${spring.security.oauth2.client.registration.facebook.client-id:}")
    private String facebookClientId;

    @Value("${spring.security.oauth2.client.registration.facebook.client-secret:}")
    private String facebookClientSecret;

    @Transactional
    public AuthResponse authenticateWithFacebook(String accessToken) {
        try {
            // Verify Facebook access token and get user info
            String url = FACEBOOK_GRAPH_API + "?fields=id,name,email,picture.type(large)&access_token=" + accessToken;

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> facebookUser = response.getBody();

            if (facebookUser == null || !facebookUser.containsKey("id")) {
                throw new BadRequestException("Invalid Facebook token");
            }

            // Extract user info
            String facebookId = (String) facebookUser.get("id");
            String name = (String) facebookUser.get("name");
            String email = (String) facebookUser.get("email");

            // Get picture URL
            String pictureUrl = extractPictureUrl(facebookUser);

            log.info("Facebook OAuth: email={}, name={}, facebookId={}", email, name, facebookId);

            // If no email from Facebook, generate a placeholder
            if (email == null || email.isEmpty()) {
                email = facebookId + "@facebook.jobverse.com";
                log.warn("No email from Facebook, using placeholder: {}", email);
            }

            // Find or create user
            final String finalEmail = email;
            final String finalPictureUrl = pictureUrl;
            User user = userRepository.findByEmail(finalEmail)
                    .orElseGet(() -> createFacebookUser(finalEmail, name, finalPictureUrl, facebookId));

            // If user exists but not linked to Facebook, link it
            if (user.getOauthProvider() == null) {
                user.setOauthProvider("FACEBOOK");
                user.setOauthId(facebookId);
                user.setEmailVerified(true);
                user = userRepository.save(user);
            }

            // Generate JWT tokens
            return generateAuthResponse(user);

        } catch (Exception e) {
            log.error("Facebook OAuth error", e);
            throw new BadRequestException("Failed to authenticate with Facebook: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private String extractPictureUrl(Map<String, Object> facebookUser) {
        if (facebookUser.containsKey("picture")) {
            Map<String, Object> picture = (Map<String, Object>) facebookUser.get("picture");
            if (picture.containsKey("data")) {
                Map<String, Object> pictureData = (Map<String, Object>) picture.get("data");
                return (String) pictureData.get("url");
            }
        }
        return null;
    }

    private User createFacebookUser(String email, String name, String picture, String facebookId) {
        log.info("Creating new Facebook user: {}", email);

        User user = User.builder()
                .email(email)
                .passwordHash(null)
                .role(User.Role.CANDIDATE)
                .status(User.Status.ACTIVE)
                .emailVerified(true)
                .oauthProvider("FACEBOOK")
                .oauthId(facebookId)
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
                .expiresIn(86400L)
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
