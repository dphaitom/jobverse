package com.jobverse.service;

@Service
@RequiredArgsConstructor
public class OAuth2Service {
    
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Value("${google.client-id}")
    private String googleClientId;
    
    @Transactional
    public AuthResponse handleGoogleLogin(String idTokenString) {
        try {
            // Verify token với Google
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
            
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) throw new RuntimeException("Invalid token");
            
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            
            // Tìm hoặc tạo user
            User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setPasswordHash("");
                    newUser.setRole(User.Role.CANDIDATE);
                    newUser.setStatus(User.Status.ACTIVE);
                    newUser.setEmailVerified(true);
                    newUser.setOauthProvider("google");
                    User saved = userRepository.save(newUser);
                    
                    // Tạo profile
                    UserProfile profile = new UserProfile();
                    profile.setUser(saved);
                    profile.setFullName(name);
                    profile.setAvatarUrl(picture);
                    userProfileRepository.save(profile);
                    
                    return saved;
                });
            
            // Generate tokens
            String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
            
            return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.fromEntity(user))
                .build();
                
        } catch (Exception e) {
            throw new RuntimeException("Google auth failed: " + e.getMessage());
        }
    }
}