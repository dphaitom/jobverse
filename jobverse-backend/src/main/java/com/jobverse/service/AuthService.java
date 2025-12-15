package com.jobverse.service;

import com.jobverse.dto.request.LoginRequest;
import com.jobverse.dto.request.RegisterRequest;
import com.jobverse.dto.response.AuthResponse;
import com.jobverse.entity.User;
import com.jobverse.entity.UserProfile;
import com.jobverse.exception.BadRequestException;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.repository.UserRepository;
import com.jobverse.security.JwtTokenProvider;
import com.jobverse.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        // Check if phone already exists
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already registered");
        }
        
        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .status(User.Status.ACTIVE)
                .emailVerified(false)
                .build();
        
        // Create profile
        UserProfile profile = UserProfile.builder()
                .user(user)
                .fullName(request.getFullName())
                .build();
        user.setProfile(profile);
        
        user = userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(user);
        
        log.info("User registered: {}", user.getEmail());
        
        // Generate tokens
        return generateAuthResponse(user);
    }
    
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByIdWithProfile(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        log.info("User logged in: {}", user.getEmail());
        
        return generateAuthResponse(user);
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }
        
        String email = tokenProvider.extractUsername(refreshToken);
        User user = userRepository.findByEmailWithProfile(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return generateAuthResponse(user);
    }
    
    public void logout(String token) {
        // In a production environment, you would invalidate the token
        // by adding it to a blacklist in Redis
        log.info("User logged out");
    }
    
    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        emailService.sendPasswordResetEmail(user);
        log.info("Password reset email sent to: {}", email);
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // Validate token and get user email
        if (!tokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid or expired reset token");
        }
        
        String email = tokenProvider.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("Password reset for user: {}", email);
    }
    
    @Transactional
    public void verifyEmail(String token) {
        if (!tokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid or expired verification token");
        }
        
        String email = tokenProvider.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setEmailVerified(true);
        userRepository.save(user);
        
        log.info("Email verified for user: {}", email);
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
