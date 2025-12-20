package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.InterviewPrepService;
import com.jobverse.service.InterviewPrepService.AnswerEvaluation;
import com.jobverse.service.InterviewPrepService.InterviewQuestions;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewPrepService interviewPrepService;

    /**
     * Generate interview questions
     * POST /api/v1/interview/questions
     * Request body: { "role": "Frontend Developer", "experienceLevel": "MID", "skills": ["React", "Node.js"] }
     */
    @PostMapping("/questions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<InterviewQuestions>> generateQuestions(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, Object> request
    ) {
        String role = (String) request.get("role");
        String experienceLevel = (String) request.get("experienceLevel");
        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) request.get("skills");

        if (role == null || role.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_INPUT", "Role is required"));
        }

        if (experienceLevel == null || experienceLevel.trim().isEmpty()) {
            experienceLevel = "JUNIOR"; // Default
        }

        InterviewQuestions questions = interviewPrepService.generateInterviewQuestions(
                role,
                experienceLevel,
                skills != null ? skills : List.of()
        );

        return ResponseEntity.ok(ApiResponse.success("Interview questions generated successfully", questions));
    }

    /**
     * Evaluate user's answer to an interview question
     * POST /api/v1/interview/evaluate
     * Request body: { "question": "...", "userAnswer": "..." }
     */
    @PostMapping("/evaluate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AnswerEvaluation>> evaluateAnswer(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, String> request
    ) {
        String question = request.get("question");
        String userAnswer = request.get("userAnswer");

        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_INPUT", "Question is required"));
        }

        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_INPUT", "User answer is required"));
        }

        AnswerEvaluation evaluation = interviewPrepService.evaluateAnswer(question, userAnswer);

        return ResponseEntity.ok(ApiResponse.success("Answer evaluated successfully", evaluation));
    }

    /**
     * Get interview tips by type
     * GET /api/v1/interview/tips?type=TECHNICAL
     */
    @GetMapping("/tips")
    public ResponseEntity<ApiResponse<List<String>>> getInterviewTips(
            @RequestParam(required = false, defaultValue = "TECHNICAL") String type
    ) {
        List<String> tips = interviewPrepService.getInterviewTips(type);

        return ResponseEntity.ok(ApiResponse.success("Interview tips retrieved", tips));
    }

    /**
     * Get all interview tip categories
     * GET /api/v1/interview/tips/categories
     */
    @GetMapping("/tips/categories")
    public ResponseEntity<ApiResponse<List<String>>> getTipCategories() {
        List<String> categories = List.of(
                "TECHNICAL",
                "HR",
                "BEHAVIORAL",
                "SYSTEM_DESIGN",
                "GENERAL"
        );

        return ResponseEntity.ok(ApiResponse.success("Tip categories retrieved", categories));
    }

    /**
     * Guest endpoint - get sample questions without auth
     * POST /api/v1/interview/questions/guest
     */
    @PostMapping("/questions/guest")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateQuestionsGuest(
            @RequestBody Map<String, Object> request
    ) {
        String role = (String) request.get("role");
        String experienceLevel = (String) request.getOrDefault("experienceLevel", "JUNIOR");

        if (role == null || role.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_INPUT", "Role is required"));
        }

        InterviewQuestions questions = interviewPrepService.generateInterviewQuestions(
                role,
                experienceLevel,
                List.of()
        );

        // Limited response for guests - only 2 questions per category
        Map<String, Object> limitedQuestions = Map.of(
                "role", role,
                "experienceLevel", experienceLevel,
                "hrQuestions", questions.getHrQuestions().subList(0, Math.min(2, questions.getHrQuestions().size())),
                "technicalQuestions", questions.getTechnicalQuestions().subList(0, Math.min(2, questions.getTechnicalQuestions().size())),
                "message", "Đăng nhập để xem toàn bộ câu hỏi và nhận đánh giá AI"
        );

        return ResponseEntity.ok(ApiResponse.success("Sample questions generated", limitedQuestions));
    }
}
