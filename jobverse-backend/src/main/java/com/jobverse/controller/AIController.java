package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, String> request
    ) {
        String message = request.get("message");
        String context = "Email: " + currentUser.getEmail() + ", Role: " + currentUser.getRole();

        String reply = aiService.chat(message, context);

        return ResponseEntity.ok(ApiResponse.success("Reply generated", Map.of("reply", reply)));
    }

    // Endpoint không cần đăng nhập (giới hạn tính năng)
    @PostMapping("/chat/guest")
    public ResponseEntity<ApiResponse<Map<String, String>>> guestChat(
            @RequestBody Map<String, String> request
    ) {
        String message = request.get("message");
        String reply = aiService.chat(message, null);

        return ResponseEntity.ok(ApiResponse.success("Reply generated", Map.of("reply", reply)));
    }
}
