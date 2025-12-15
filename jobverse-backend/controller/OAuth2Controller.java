package com.jobverse.controller;

@RestController
@RequestMapping("/v1/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {
    
    private final OAuth2Service oauth2Service;
    
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @RequestBody Map<String, String> request
    ) {
        String idToken = request.get("token");
        AuthResponse response = oauth2Service.handleGoogleLogin(idToken);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}