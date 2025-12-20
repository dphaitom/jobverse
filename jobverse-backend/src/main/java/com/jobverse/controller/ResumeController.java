package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.security.CurrentUser;
import com.jobverse.security.UserPrincipal;
import com.jobverse.service.ResumeAnalysisService;
import com.jobverse.service.ResumeAnalysisService.MatchResult;
import com.jobverse.service.ResumeAnalysisService.ResumeAnalysisResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/v1/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeAnalysisService resumeAnalysisService;

    /**
     * Analyze resume/CV text
     * POST /api/v1/resume/analyze
     * Request body: { "resumeText": "..." }
     */
    @PostMapping("/analyze")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ResumeAnalysisResult>> analyzeResume(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, String> request
    ) {
        String resumeText = request.get("resumeText");

        if (resumeText == null || resumeText.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_INPUT", "Resume text is required"));
        }

        ResumeAnalysisResult result = resumeAnalysisService.analyzeResume(resumeText);

        return ResponseEntity.ok(ApiResponse.success("Resume analyzed successfully", result));
    }

    /**
     * Match resume to a job
     * POST /api/v1/resume/match
     * Request body: { "resumeText": "...", "jobSkills": ["React", "Node.js", ...] }
     */
    @PostMapping("/match")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MatchResult>> matchResumeToJob(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, Object> request
    ) {
        String resumeText = (String) request.get("resumeText");
        @SuppressWarnings("unchecked")
        List<String> jobSkillsList = (List<String>) request.get("jobSkills");

        if (resumeText == null || resumeText.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_INPUT", "Resume text is required"));
        }

        if (jobSkillsList == null || jobSkillsList.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_INPUT", "Job skills are required"));
        }

        Set<String> jobSkills = new HashSet<>(jobSkillsList);

        // First analyze the resume
        ResumeAnalysisResult resumeAnalysis = resumeAnalysisService.analyzeResume(resumeText);

        // Then match to job
        MatchResult matchResult = resumeAnalysisService.matchResumeToJob(resumeAnalysis, jobSkills);

        return ResponseEntity.ok(ApiResponse.success("Resume matched to job successfully", matchResult));
    }

    /**
     * Get quick tips for resume improvement
     * GET /api/v1/resume/tips
     */
    @GetMapping("/tips")
    public ResponseEntity<ApiResponse<List<String>>> getResumeTips() {
        List<String> tips = List.of(
                "📝 Sử dụng keywords từ mô tả công việc để tăng ATS score",
                "📊 Định lượng thành tích (ví dụ: 'Tăng performance 30%')",
                "🎯 Tùy chỉnh CV cho mỗi vị trí ứng tuyển",
                "💼 Highlight 3-5 skills quan trọng nhất ở đầu CV",
                "🔗 Thêm LinkedIn, GitHub, Portfolio links",
                "📏 Giữ CV trong 1-2 trang, format rõ ràng",
                "✅ Kiểm tra lỗi chính tả và grammar kỹ lưỡng",
                "🏆 Đặt achievements nổi bật lên trên",
                "📱 Đảm bảo CV có thể đọc được trên mobile",
                "🔄 Cập nhật CV định kỳ mỗi 3-6 tháng"
        );

        return ResponseEntity.ok(ApiResponse.success("Resume tips retrieved", tips));
    }

    /**
     * Guest endpoint - limited analysis without auth
     * POST /api/v1/resume/analyze/guest
     */
    @PostMapping("/analyze/guest")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzeResumeGuest(
            @RequestBody Map<String, String> request
    ) {
        String resumeText = request.get("resumeText");

        if (resumeText == null || resumeText.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_INPUT", "Resume text is required"));
        }

        // Limited analysis for guests
        ResumeAnalysisResult result = resumeAnalysisService.analyzeResume(resumeText);

        // Only return basic info for guests
        Map<String, Object> limitedResult = Map.of(
                "overallScore", result.getOverallScore(),
                "atsScore", result.getAtsScore(),
                "skills", result.getSkills().subList(0, Math.min(5, result.getSkills().size())),
                "message", "Đăng nhập để xem phân tích đầy đủ và gợi ý chi tiết"
        );

        return ResponseEntity.ok(ApiResponse.success("Basic resume analysis completed", limitedResult));
    }
}
