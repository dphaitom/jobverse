package com.jobverse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${openai.enabled:false}")
    private boolean openaiEnabled;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Enhanced AI Chat with Smart Mock Responses
     * Sử dụng thuật toán NLP đơn giản để phân tích ý định và ngữ cảnh
     */
    public String chat(String userMessage, String context) {
        log.info("AI Chat Request - Message: '{}', Has Context: {}",
            userMessage.substring(0, Math.min(50, userMessage.length())),
            context != null && !context.isBlank());

        // Kiểm tra OpenAI configuration
        boolean canUseOpenAI = apiKey != null && !apiKey.isBlank() &&
                               openaiEnabled && !apiKey.contains("your-api-key");

        if (!canUseOpenAI) {
            log.info("Using Enhanced Smart Mock AI (OpenAI disabled or not configured)");
            return getSmartMockResponse(userMessage, context);
        }

        try {
            log.info("Attempting OpenAI API call...");
            String response = chatWithOpenAI(userMessage, context);
            log.info("OpenAI API call successful");
            return response;
        } catch (Exception e) {
            log.error("OpenAI API failed: {} - Falling back to Smart Mock AI", e.getMessage());
            return getSmartMockResponse(userMessage, context);
        }
    }

    /**
     * Direct OpenAI call for interview evaluation - bypasses intent matching
     * This ensures user answers are properly evaluated by AI
     */
    public String evaluateInterviewAnswer(String question, String userAnswer) {
        log.info("Interview Evaluation Request - Question: '{}'", 
            question.substring(0, Math.min(50, question.length())));

        boolean canUseOpenAI = apiKey != null && !apiKey.isBlank() &&
                               openaiEnabled && !apiKey.contains("your-api-key");

        String prompt = String.format("""
            Bạn là một interviewer chuyên nghiệp. Hãy đánh giá câu trả lời phỏng vấn sau:

            📝 CÂU HỎI: %s

            💬 CÂU TRẢ LỜI CỦA ỨNG VIÊN: %s

            Hãy đánh giá chi tiết theo format sau:

            ⭐ ĐIỂM MẠNH:
            • [liệt kê 2-3 điểm tốt trong câu trả lời]

            ⚠️ CẦN CẢI THIỆN:
            • [liệt kê 2-3 điểm cần cải thiện cụ thể]

            💡 GỢI Ý CÂU TRẢ LỜI TỐT HƠN:
            • [đưa ra gợi ý cụ thể để cải thiện câu trả lời]

            📊 ĐÁNH GIÁ TỔNG THỂ: [X/10 điểm]
            [1-2 câu tổng kết ngắn gọn]

            Lưu ý: Đánh giá dựa trên nội dung thực tế của câu trả lời, không đánh giá chung chung.
            Trả lời bằng tiếng Việt, thực tế và hữu ích.
            """, question, userAnswer);

        if (!canUseOpenAI) {
            log.info("OpenAI not available - using mock evaluation");
            return getMockEvaluation(question, userAnswer);
        }

        try {
            log.info("Calling OpenAI for interview evaluation...");
            String response = callOpenAIDirectly(prompt);
            log.info("OpenAI evaluation successful");
            return response;
        } catch (Exception e) {
            log.error("OpenAI evaluation failed: {} - Using mock evaluation", e.getMessage());
            return getMockEvaluation(question, userAnswer);
        }
    }

    /**
     * Direct OpenAI API call without career coach system prompt
     */
    private String callOpenAIDirectly(String prompt) {
        Map<String, Object> request = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", "Bạn là một chuyên gia phỏng vấn IT với nhiều năm kinh nghiệm. Hãy đánh giá câu trả lời một cách công bằng, chi tiết và hữu ích."),
                Map.of("role", "user", "content", prompt)
            ),
            "max_tokens", 1000,
            "temperature", 0.7
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            "https://api.openai.com/v1/chat/completions",
            entity,
            Map.class
        );

        Map<String, Object> body = response.getBody();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

        return (String) message.get("content");
    }

    /**
     * Generate AI-powered sample answer for interview question
     */
    public String generateInterviewAnswer(String question, String role, String experienceLevel) {
        log.info("Generating AI answer for question: {}", question.substring(0, Math.min(50, question.length())));

        boolean canUseOpenAI = apiKey != null && !apiKey.isBlank() &&
                               openaiEnabled && !apiKey.contains("your-api-key");

        String prompt = String.format("""
            Bạn là một ứng viên IT đang phỏng vấn cho vị trí %s với level %s.
            
            📝 CÂU HỎI PHỎNG VẤN: %s

            Hãy đưa ra một câu trả lời mẫu xuất sắc theo format sau:

            💬 CÂU TRẢ LỜI MẪU:
            [Viết câu trả lời hoàn chỉnh, tự nhiên như đang nói chuyện với interviewer]

            🎯 PHÂN TÍCH CẤU TRÚC:
            • Mở đầu: [giải thích cách mở đầu]
            • Thân bài: [giải thích các điểm chính]
            • Kết thúc: [giải thích cách kết thúc ấn tượng]

            💡 MẸO GHI NHỚ:
            • [2-3 tips ngắn gọn để nhớ cách trả lời]

            Lưu ý:
            - Câu trả lời phải phù hợp với level %s
            - Sử dụng phương pháp STAR nếu là câu hỏi behavioral
            - Đưa ra ví dụ cụ thể và thực tế
            - Trả lời bằng tiếng Việt, tự nhiên và chuyên nghiệp
            """, role, experienceLevel, question, experienceLevel);

        if (!canUseOpenAI) {
            log.info("OpenAI not available - using mock answer generation");
            return getMockGeneratedAnswer(question, role, experienceLevel);
        }

        try {
            log.info("Calling OpenAI to generate interview answer...");
            
            Map<String, Object> request = Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "system", "content", "Bạn là một chuyên gia coaching phỏng vấn IT. Hãy đưa ra câu trả lời mẫu xuất sắc, thực tế và có thể áp dụng ngay."),
                    Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 1200,
                "temperature", 0.8
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions",
                entity,
                Map.class
            );

            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

            log.info("OpenAI answer generation successful");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("OpenAI answer generation failed: {} - Using mock", e.getMessage());
            return getMockGeneratedAnswer(question, role, experienceLevel);
        }
    }

    /**
     * Mock generated answer when OpenAI is not available
     */
    private String getMockGeneratedAnswer(String question, String role, String experienceLevel) {
        String questionLower = question.toLowerCase();
        
        if (questionLower.contains("yourself") || questionLower.contains("bản thân")) {
            return String.format("""
                💬 CÂU TRẢ LỜI MẪU:
                "Xin chào, tôi là một %s với kinh nghiệm ở level %s. Trong thời gian qua, tôi đã làm việc với các công nghệ như [tech stack phù hợp với role]. 
                
                Điểm mạnh của tôi là khả năng giải quyết vấn đề và làm việc nhóm hiệu quả. Tôi đã từng tham gia dự án [mô tả dự án] và đạt được kết quả [kết quả cụ thể].
                
                Tôi rất hào hứng với cơ hội này vì [lý do phù hợp với công ty]."

                🎯 PHÂN TÍCH CẤU TRÚC:
                • Mở đầu: Giới thiệu ngắn gọn về bản thân và vị trí hiện tại
                • Thân bài: Nêu điểm mạnh + ví dụ cụ thể từ kinh nghiệm
                • Kết thúc: Liên kết với vị trí đang ứng tuyển

                💡 MẸO GHI NHỚ:
                • Chuẩn bị script 2 phút, luyện tập trước gương
                • Focus vào achievements, không chỉ responsibilities
                • Customize theo từng công ty bạn phỏng vấn
                """, role, experienceLevel);
        }
        
        if (questionLower.contains("why") || questionLower.contains("tại sao")) {
            return """
                💬 CÂU TRẢ LỜI MẪU:
                "Tôi đã tìm hiểu về công ty và rất ấn tượng với [sản phẩm/văn hóa/giá trị của công ty]. 
                
                Đặc biệt, tôi thấy [điểm cụ thể về công ty] rất phù hợp với định hướng phát triển của tôi. 
                
                Với kinh nghiệm của mình trong [lĩnh vực liên quan], tôi tin rằng tôi có thể đóng góp vào [mục tiêu của công ty]."

                🎯 PHÂN TÍCH CẤU TRÚC:
                • Mở đầu: Cho thấy bạn đã research về công ty
                • Thân bài: Liên kết giữa công ty và bản thân
                • Kết thúc: Nêu giá trị bạn có thể mang lại

                💡 MẸO GHI NHỚ:
                • Research kỹ về công ty trước khi phỏng vấn
                • Nêu điểm cụ thể, không nói chung chung
                • Tránh nói về lương/benefits ở câu hỏi này
                """;
        }

        return String.format("""
            💬 CÂU TRẢ LỜI MẪU:
            Đây là câu hỏi về: "%s"
            
            Một câu trả lời tốt cho vị trí %s level %s nên bao gồm:
            1. Trả lời trực tiếp vào câu hỏi
            2. Đưa ra ví dụ cụ thể từ kinh nghiệm
            3. Liên kết với vị trí đang ứng tuyển

            🎯 PHÂN TÍCH CẤU TRÚC:
            • Sử dụng phương pháp STAR cho câu hỏi behavioral
            • Nêu số liệu cụ thể nếu có thể
            • Kết thúc bằng việc liên kết với role

            💡 MẸO GHI NHỚ:
            • Chuẩn bị 3-5 stories có thể dùng cho nhiều câu hỏi
            • Practice với bạn bè hoặc trước gương
            • Đăng nhập và bật OpenAI để nhận câu trả lời chi tiết hơn!
            """, question, role, experienceLevel);
    }

    /**
     * Mock evaluation when OpenAI is not available
     */
    private String getMockEvaluation(String question, String userAnswer) {
        int wordCount = userAnswer.split("\\s+").length;
        String lengthFeedback;
        int baseScore;

        if (wordCount < 10) {
            lengthFeedback = "Câu trả lời quá ngắn, cần mở rộng thêm";
            baseScore = 4;
        } else if (wordCount < 30) {
            lengthFeedback = "Độ dài câu trả lời ở mức trung bình";
            baseScore = 6;
        } else if (wordCount < 60) {
            lengthFeedback = "Câu trả lời có độ dài tốt";
            baseScore = 7;
        } else {
            lengthFeedback = "Câu trả lời chi tiết và đầy đủ";
            baseScore = 8;
        }

        boolean hasExample = userAnswer.toLowerCase().contains("ví dụ") || 
                            userAnswer.toLowerCase().contains("example") ||
                            userAnswer.toLowerCase().contains("project");
        boolean hasStructure = userAnswer.toLowerCase().contains("đầu tiên") || 
                              userAnswer.toLowerCase().contains("first") ||
                              userAnswer.toLowerCase().contains("thứ hai");

        if (hasExample) baseScore += 1;
        if (hasStructure) baseScore += 1;
        baseScore = Math.min(baseScore, 10);

        return String.format("""
            ⭐ ĐIỂM MẠNH:
            • %s
            • Bạn đã trả lời đúng trọng tâm câu hỏi
            %s

            ⚠️ CẦN CẢI THIỆN:
            • %s
            • Nên thêm ví dụ cụ thể từ kinh nghiệm thực tế
            • Sử dụng phương pháp STAR (Situation, Task, Action, Result) để trả lời có cấu trúc hơn

            💡 GỢI Ý CÂU TRẢ LỜI TỐT HƠN:
            • Bắt đầu bằng việc nêu bối cảnh cụ thể
            • Mô tả hành động bạn đã thực hiện
            • Kết thúc bằng kết quả đạt được (có số liệu nếu có thể)

            📊 ĐÁNH GIÁ TỔNG THỂ: %d/10 điểm
            %s. Hãy luyện tập thêm với các câu hỏi tương tự để cải thiện kỹ năng phỏng vấn!
            """,
            lengthFeedback,
            hasExample ? "• Có đưa ra ví dụ minh họa" : "",
            wordCount < 30 ? "Câu trả lời cần chi tiết hơn" : "Có thể tóm gọn hơn ở một số phần",
            baseScore,
            baseScore >= 7 ? "Câu trả lời khá tốt" : "Câu trả lời cần cải thiện thêm"
        );
    }

    private String chatWithOpenAI(String userMessage, String context) {
        String systemPrompt = """
            Bạn là AI Career Coach chuyên nghiệp của JobVerse - nền tảng tuyển dụng IT hàng đầu Việt Nam.

            NHIỆM VỤ:
            • Tư vấn định hướng nghề nghiệp IT (Frontend, Backend, Mobile, DevOps, AI/ML...)
            • Review và cải thiện CV, Portfolio
            • Chuẩn bị kỹ năng phỏng vấn (Technical, HR, Coding test)
            • Đề xuất việc làm, roadmap học tập phù hợp
            • Tư vấn về mức lương, thị trường IT Việt Nam

            PHONG CÁCH:
            • Trả lời bằng tiếng Việt, thân thiện, dễ hiểu
            • Cung cấp thông tin cụ thể, có ví dụ thực tế
            • Sử dụng emoji phù hợp để sinh động
            • Đưa ra lời khuyên thực tế, có thể áp dụng ngay
            • Khuyến khích và động viên ứng viên

            LƯU Ý:
            • Tập trung vào ngành IT/Tech tại Việt Nam
            • Đưa ra roadmap, checklist cụ thể khi có thể
            • Hỏi thêm thông tin nếu cần để tư vấn chính xác hơn
            """ + (context != null ? "\n\nTHÔNG TIN ỨNG VIÊN:\n" + context : "");

        Map<String, Object> request = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            ),
            "max_tokens", 800,
            "temperature", 0.8,
            "top_p", 0.9,
            "frequency_penalty", 0.3,
            "presence_penalty", 0.3
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            "https://api.openai.com/v1/chat/completions",
            entity,
            Map.class
        );

        Map<String, Object> body = response.getBody();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

        return (String) message.get("content");
    }

    /**
     * Enhanced Smart Mock Response System
     * Sử dụng pattern matching và context analysis
     */
    private String getSmartMockResponse(String userMessage, String context) {
        String msg = userMessage.toLowerCase().trim();

        // Intent Analysis - phân tích ý định người dùng
        Intent intent = analyzeIntent(msg);

        // Context Enhancement - tùy chỉnh response dựa trên context
        String contextInfo = "";
        if (context != null && !context.isBlank()) {
            contextInfo = "\n\n💡 *Dựa trên thông tin của bạn, tôi nhận thấy: " +
                         extractContextInsight(context) + "*";
        }

        return switch (intent) {
            case GREETING -> getGreetingResponse();
            case CV_REVIEW -> getCVAdviceResponse() + contextInfo;
            case INTERVIEW_PREP -> getInterviewPrepResponse() + contextInfo;
            case CAREER_ADVICE -> getCareerAdviceResponse() + contextInfo;
            case SALARY_INQUIRY -> getSalaryInsightResponse() + contextInfo;
            case SKILL_LEARNING -> getSkillLearningResponse(msg) + contextInfo;
            case JOB_SEARCH -> getJobSearchAdviceResponse() + contextInfo;
            case RESUME_PARSE -> getResumeParsingResponse() + contextInfo;
            default -> getDefaultResponse();
        };
    }

    /**
     * Phân tích ý định người dùng từ message
     */
    private Intent analyzeIntent(String message) {
        // Greeting patterns
        if (matches(message, "hello", "hi", "xin chào", "chào", "hey", "hế lô")) {
            return Intent.GREETING;
        }

        // CV/Resume patterns
        if (matches(message, "cv", "resume", "hồ sơ", "sơ yếu lý lịch", "curriculum vitae")) {
            return Intent.CV_REVIEW;
        }

        // Interview patterns
        if (matches(message, "phỏng vấn", "interview", "buổi pv", "面试")) {
            return Intent.INTERVIEW_PREP;
        }

        // Career advice patterns
        if (matches(message, "nghề nghiệp", "career", "công việc", "chuyển ngành", "định hướng")) {
            return Intent.CAREER_ADVICE;
        }

        // Salary patterns
        if (matches(message, "lương", "salary", "thu nhập", "income", "compensation")) {
            return Intent.SALARY_INQUIRY;
        }

        // Learning/Skills patterns
        if (matches(message, "học", "learn", "kỹ năng", "skill", "roadmap", "khóa học", "course")) {
            return Intent.SKILL_LEARNING;
        }

        // Job search patterns
        if (matches(message, "tìm việc", "job search", "ứng tuyển", "apply", "việc làm")) {
            return Intent.JOB_SEARCH;
        }

        // Resume parsing patterns
        if (matches(message, "phân tích cv", "parse resume", "đọc cv", "analyze resume")) {
            return Intent.RESUME_PARSE;
        }

        return Intent.GENERAL;
    }

    private boolean matches(String text, String... keywords) {
        // Use word boundary matching to avoid partial matches (e.g., "help" matching "hey")
        return Arrays.stream(keywords).anyMatch(keyword -> {
            String pattern = "(?i)\\b" + java.util.regex.Pattern.quote(keyword) + "\\b";
            return java.util.regex.Pattern.compile(pattern).matcher(text).find();
        });
    }

    private String extractContextInsight(String context) {
        if (context.contains("email")) {
            return "Hồ sơ của bạn đã được liên kết với hệ thống";
        }
        return "Tôi đang xem xét thông tin của bạn để đưa ra lời khuyên phù hợp nhất";
    }

    // Response Generators
    private String getGreetingResponse() {
        return """
            👋 Xin chào! Tôi là **AI Career Coach** của JobVerse.

            🎯 Tôi có thể giúp bạn:
            • 📄 Review & cải thiện CV/Resume
            • 💼 Tư vấn định hướng nghề nghiệp IT
            • 🎤 Chuẩn bị kỹ năng phỏng vấn
            • 💰 Tham khảo mức lương thị trường
            • 📚 Roadmap học tập & phát triển kỹ năng
            • 🔍 Tìm việc làm phù hợp

            Bạn cần tôi hỗ trợ điều gì hôm nay? 😊
            """;
    }

    private String getCVAdviceResponse() {
        return """
            📄 **Hướng dẫn tạo CV ấn tượng cho IT/Tech:**

            ✅ **Cấu trúc CV hiệu quả:**
            1. **Header**: Tên, Title, Contact (Email, Phone, LinkedIn, GitHub)
            2. **Summary**: 3-4 câu highlight kinh nghiệm & điểm mạnh
            3. **Technical Skills**:
               - Languages: Java, Python, JavaScript...
               - Frameworks: React, Spring Boot, Node.js...
               - Tools: Git, Docker, AWS...
            4. **Work Experience**:
               - Dùng bullet points với công thức: Action Verb + Task + Result
               - VD: "Developed microservices handling 10K requests/day, reducing latency by 40%"
            5. **Projects**: 2-3 dự án nổi bật (có link GitHub/Demo)
            6. **Education**: Bằng cấp, GPA (nếu > 3.0)
            7. **Certifications**: AWS, Azure, Scrum Master...

            🎨 **Tips thiết kế:**
            • Dùng template clean, professional (ATS-friendly)
            • Font: Arial, Calibri, Times New Roman (10-12pt)
            • Độ dài: 1-2 trang (Junior: 1 trang, Senior: 2 trang)
            • Format: PDF (không dùng Word)

            ⚠️ **Tránh những lỗi sau:**
            ❌ Ảnh đại diện (trừ khi yêu cầu)
            ❌ Thông tin cá nhân không cần thiết (CMND, tình trạng hôn nhân...)
            ❌ Liệt kê skills không liên quan
            ❌ Viết mô tả công việc dài dòng

            💡 Bạn muốn tôi review CV của bạn chi tiết hơn không?
            """;
    }

    private String getInterviewPrepResponse() {
        return """
            🎤 **Cẩm nang chuẩn bị phỏng vấn IT/Tech:**

            📋 **3 giai đoạn phỏng vấn:**

            **1️⃣ HR Round (30-45 phút):**
            • Giới thiệu bản thân (Elevator pitch 2 phút)
            • Tại sao muốn join công ty?
            • Kỳ vọng về lương & career path
            • Điểm mạnh/yếu của bạn

            **2️⃣ Technical Round (60-90 phút):**
            • Coding Challenge: LeetCode Medium level
            • System Design: Thiết kế API, Database schema
            • CS Fundamentals: OOP, Data Structures, Algorithms
            • Specific Tech: React/Spring Boot/Cloud...

            **3️⃣ Manager/Culture Fit (30-45 phút):**
            • Scenario-based questions
            • Teamwork & conflict resolution
            • Leadership & problem-solving

            🔥 **Top câu hỏi thường gặp:**
            1. "Tell me about yourself" → Chuẩn bị script 2 phút
            2. "Why are you leaving current job?" → Focus vào growth, không nói xấu cũ
            3. "Describe a challenging project" → Dùng STAR method
            4. "Where do you see yourself in 5 years?" → Align với company's growth

            💻 **Technical Prep:**
            • LeetCode: 50+ bài (Easy: 20, Medium: 25, Hard: 5)
            • System Design: Xem videos từ ByteByteGo, System Design Primer
            • Mock Interview: Pramp, Interviewing.io

            📚 **Resources:**
            • Cracking the Coding Interview (book)
            • System Design Interview (Alex Xu)
            • Tech Interview Handbook (website)

            🎯 Bạn đang chuẩn bị cho vòng phỏng vấn nào? Tôi có thể hướng dẫn chi tiết hơn!
            """;
    }

    private String getCareerAdviceResponse() {
        return """
            🚀 **Định hướng nghề nghiệp IT - Lộ trình 2025:**

            🎯 **Top 7 ngành hot nhất:**

            1. **AI/ML Engineer** 🤖
               • Skills: Python, TensorFlow, PyTorch, LLMs
               • Lương: 25-80 triệu/tháng
               • Cơ hội: ⭐⭐⭐⭐⭐

            2. **Full-Stack Developer** 💻
               • Skills: React/Next.js + Node.js/Spring Boot
               • Lương: 15-50 triệu/tháng
               • Cơ hội: ⭐⭐⭐⭐⭐

            3. **Cloud/DevOps Engineer** ☁️
               • Skills: AWS/Azure, Docker, Kubernetes, Terraform
               • Lương: 20-60 triệu/tháng
               • Cơ hội: ⭐⭐⭐⭐

            4. **Mobile Developer** 📱
               • Skills: React Native, Flutter, Swift, Kotlin
               • Lương: 15-45 triệu/tháng
               • Cơ hội: ⭐⭐⭐⭐

            5. **Data Engineer** 📊
               • Skills: SQL, Spark, Airflow, Data Pipeline
               • Lương: 18-55 triệu/tháng
               • Cơ hội: ⭐⭐⭐⭐

            6. **Security Engineer** 🔐
               • Skills: Penetration Testing, SIEM, Firewall
               • Lương: 20-70 triệu/tháng
               • Cơ hội: ⭐⭐⭐⭐

            7. **Blockchain Developer** ⛓️
               • Skills: Solidity, Web3.js, Smart Contracts
               • Lương: 25-80 triệu/tháng
               • Cơ hội: ⭐⭐⭐

            📈 **Roadmap chung cho mọi ngành:**

            **Giai đoạn 1: Foundation (3-6 tháng)**
            • CS Fundamentals: Data Structures, Algorithms
            • Programming: Python/JavaScript
            • Git/GitHub, Linux basics

            **Giai đoạn 2: Specialization (6-12 tháng)**
            • Chọn 1-2 ngành focus (VD: Frontend + Mobile)
            • Learn frameworks & tools
            • Build 3-5 projects

            **Giai đoạn 3: Professional (1-2 năm)**
            • Contribute to open source
            • Get certifications (AWS, Azure...)
            • Build network & personal brand

            💡 Bạn đang ở giai đoạn nào? Muốn focus vào ngành nào?
            """;
    }

    private String getSalaryInsightResponse() {
        return """
            💰 **Bảng lương IT/Tech Việt Nam 2025:**

            📊 **Theo cấp độ kinh nghiệm:**

            **Fresher/Intern (0-1 năm):**
            • Frontend/Backend: 6-12 triệu
            • Mobile: 7-13 triệu
            • QA/Tester: 5-10 triệu
            • DevOps: 8-14 triệu

            **Junior (1-3 năm):**
            • Frontend/Backend: 12-20 triệu
            • Mobile: 13-22 triệu
            • QA/Tester: 10-16 triệu
            • DevOps: 14-24 triệu
            • Data Engineer: 15-25 triệu

            **Middle (3-5 năm):**
            • Frontend/Backend: 20-35 triệu
            • Mobile: 22-38 triệu
            • QA/Tester: 16-28 triệu
            • DevOps: 24-40 triệu
            • Data Engineer: 25-42 triệu
            • AI/ML: 28-50 triệu

            **Senior (5-8 năm):**
            • Frontend/Backend: 35-60 triệu
            • Mobile: 38-65 triệu
            • DevOps: 40-70 triệu
            • Data Engineer: 42-75 triệu
            • AI/ML: 50-90 triệu
            • Security: 45-80 triệu

            **Lead/Architect (8+ năm):**
            • Tech Lead: 60-100 triệu
            • Solution Architect: 70-120 triệu
            • Engineering Manager: 80-150 triệu

            🏢 **Theo loại công ty:**
            • Outsourcing: Base salary (x1.0)
            • Product VN: Base salary x1.2-1.5
            • Foreign Product: Base salary x1.5-2.5
            • Big Tech (Google, Meta...): $3000-15000/month

            🎁 **Benefits phổ biến:**
            • 13th month salary
            • Performance bonus: 1-6 tháng lương
            • Health insurance
            • Annual leave: 12-18 ngày
            • Remote/Hybrid work
            • Training budget
            • Stock options (startups/big tech)

            💡 **Tips tăng lương:**
            ✅ Master 1-2 tech stacks chuyên sâu
            ✅ Có certifications (AWS, GCP, Azure...)
            ✅ Contribute open source → build reputation
            ✅ Switch job mỗi 2-3 năm (tăng 20-40%)
            ✅ Negotiate tốt (research market rate trước)

            📍 Bạn muốn biết mức lương cho vị trí/tech stack cụ thể nào?
            """;
    }

    private String getSkillLearningResponse(String message) {
        // Detect specific technology
        String tech = "";
        if (message.contains("react")) tech = "React";
        else if (message.contains("java") || message.contains("spring")) tech = "Java/Spring Boot";
        else if (message.contains("python")) tech = "Python";
        else if (message.contains("node")) tech = "Node.js";
        else if (message.contains("aws") || message.contains("cloud")) tech = "Cloud/AWS";

        if (!tech.isEmpty()) {
            return getSpecificTechRoadmap(tech);
        }

        return """
            📚 **Lộ trình học IT từ zero đến hero:**

            🎯 **Phase 1: Fundamentals (2-3 tháng)**

            **Week 1-4: Programming Basics**
            • Chọn ngôn ngữ đầu tiên: Python (dễ) hoặc JavaScript (web)
            • Học: Variables, Data types, Loops, Functions
            • Practice: 50+ bài trên HackerRank/LeetCode Easy

            **Week 5-8: Data Structures & Algorithms**
            • Array, LinkedList, Stack, Queue
            • Tree, Graph, Hash Table
            • Sorting, Searching algorithms
            • Resource: "Algorithms" - Sedgewick

            **Week 9-12: CS Fundamentals**
            • OOP: Classes, Inheritance, Polymorphism
            • Database: SQL basics, CRUD operations
            • Git/GitHub: Version control
            • Linux: Basic commands

            ---

            🎯 **Phase 2: Specialization (4-6 tháng)**

            Chọn 1 trong 3 tracks:

            **🌐 Track 1: Web Development**
            • Frontend: HTML/CSS → JavaScript → React/Vue
            • Backend: Node.js/Express hoặc Spring Boot
            • Database: PostgreSQL, MongoDB
            • Project: Build Fullstack Todo App, E-commerce

            **📱 Track 2: Mobile Development**
            • Cross-platform: React Native hoặc Flutter
            • Native: Swift (iOS) hoặc Kotlin (Android)
            • API Integration, State Management
            • Project: Build Social Media App clone

            **🤖 Track 3: AI/ML**
            • Python: NumPy, Pandas, Matplotlib
            • ML: Scikit-learn, TensorFlow
            • Deep Learning: Neural Networks, CNNs
            • Project: Image Classification, NLP chatbot

            ---

            🎯 **Phase 3: Professional (6-12 tháng)**

            **Build Portfolio:**
            • 3-5 substantial projects on GitHub
            • Personal website/blog
            • Contribute to open source

            **Get Certified:**
            • AWS Certified Developer
            • Google Cloud Associate
            • Meta React Certification

            **Network:**
            • Join tech communities (Discord, Reddit)
            • Attend meetups/hackathons
            • Build LinkedIn presence

            ---

            📖 **Free Resources:**
            • FreeCodeCamp, The Odin Project
            • CS50 (Harvard), MIT OpenCourseWare
            • YouTube: Traversy Media, Fireship, ThePrimeagen
            • Udemy/Coursera (wait for sales)

            💡 Bạn muốn roadmap chi tiết cho tech stack nào? (React, Java, Python, Cloud...)
            """;
    }

    private String getSpecificTechRoadmap(String tech) {
        return switch (tech) {
            case "React" -> """
                ⚛️ **React Developer Roadmap 2025:**

                **Level 1: JavaScript Mastery (1 tháng)**
                • ES6+: Arrow functions, Destructuring, Spread
                • Async: Promises, Async/Await
                • Array methods: map, filter, reduce
                • DOM Manipulation

                **Level 2: React Fundamentals (1.5 tháng)**
                • JSX, Components (Functional)
                • Props & State
                • Hooks: useState, useEffect, useContext
                • Event Handling, Conditional Rendering
                • Lists & Keys

                **Level 3: Advanced React (2 tháng)**
                • Custom Hooks
                • useReducer, useMemo, useCallback
                • Context API + useContext
                • React Router v6
                • Form Handling: React Hook Form

                **Level 4: State Management (1 tháng)**
                • Redux Toolkit (hoặc Zustand - đơn giản hơn)
                • Redux Thunk/RTK Query
                • State design patterns

                **Level 5: Ecosystem (1.5 tháng)**
                • Styling: TailwindCSS, Styled Components
                • Build Tool: Vite (nhanh hơn CRA)
                • TypeScript với React
                • Testing: Jest, React Testing Library
                • API: Axios, React Query

                **Level 6: Production Ready (1 tháng)**
                • Performance: Code splitting, Lazy loading
                • SEO: Next.js (SSR/SSG)
                • Deployment: Vercel, Netlify
                • Error Boundaries, Logging

                🎯 **Project Ideas:**
                1. Todo App (Hooks, Context API)
                2. E-commerce (Redux, React Router)
                3. Social Media Dashboard (Next.js, TypeScript)
                4. Real-time Chat (WebSockets, React Query)

                📚 **Resources:**
                • Official React Docs (react.dev)
                • "Epic React" - Kent C. Dodds
                • YouTube: Jack Herrington, Web Dev Simplified
                """;
            case "Java/Spring Boot" -> """
                ☕ **Java Spring Boot Developer Roadmap:**

                **Level 1: Java Core (1.5 tháng)**
                • OOP: Classes, Inheritance, Polymorphism
                • Collections: List, Set, Map
                • Streams & Lambda
                • Exception Handling
                • Generics, Annotations

                **Level 2: Spring Basics (1 tháng)**
                • Dependency Injection, IoC Container
                • Spring Boot Auto-configuration
                • Spring MVC (Controllers, Services)
                • RESTful API design

                **Level 3: Database & ORM (1.5 tháng)**
                • SQL: CRUD, Joins, Subqueries
                • Spring Data JPA
                • Hibernate relationships
                • Database migrations: Flyway

                **Level 4: Security (1 tháng)**
                • Spring Security
                • JWT Authentication
                • OAuth2, Role-based access

                **Level 5: Advanced (2 tháng)**
                • Microservices: Spring Cloud
                • Message Queue: RabbitMQ, Kafka
                • Caching: Redis
                • Docker, Kubernetes

                **Level 6: Testing & DevOps (1 tháng)**
                • JUnit 5, Mockito
                • Integration tests
                • CI/CD: Jenkins, GitHub Actions
                • Monitoring: Actuator, Prometheus

                🎯 **Project:**
                Build Job Portal API (JobVerse backend clone!)
                """;
            default -> getSkillLearningResponse("");
        };
    }

    private String getJobSearchAdviceResponse() {
        return """
            🔍 **Chiến lược tìm việc IT hiệu quả:**

            📍 **Top nguồn tuyển dụng IT VN:**
            1. **JobVerse** (AI-powered matching) 😉
            2. ITviec.com - #1 cho IT jobs
            3. TopDev.vn - Senior/Lead positions
            4. VietnamWorks - Đa ngành
            5. LinkedIn - Foreign companies
            6. CareerBuilder, JobStreet
            7. Facebook Groups: "Vietnam IT Jobs", "React Vietnam"

            💼 **5 bước apply hiệu quả:**

            **Bước 1: Chuẩn bị hồ sơ**
            ✅ CV ATS-friendly, tailored cho từng job
            ✅ LinkedIn profile đầy đủ (photo, headline, summary)
            ✅ GitHub với 3-5 projects sạch sẽ
            ✅ Portfolio website (optional nhưng +điểm)

            **Bước 2: Target đúng jobs**
            ✅ Match 60-70% JD là đủ apply (đừng chờ 100%)
            ✅ Focus vào culture fit, tech stack phù hợp
            ✅ Avoid: Red flags (OT không lương, turnover rate cao)

            **Bước 3: Personalize application**
            ✅ Cover letter ngắn gọn (3-4 đoạn)
            ✅ Mention specific projects/values của company
            ✅ Explain tại sao bạn fit

            **Bước 4: Follow up**
            ✅ Email/message recruiter sau 3-5 ngày
            ✅ Connect LinkedIn với hiring manager
            ✅ Show enthusiasm nhưng không spam

            **Bước 5: Negotiate offer**
            ✅ Research market rate (ITviec Salary Report)
            ✅ Có multiple offers để leverage
            ✅ Negotiate toàn bộ package (salary, bonus, benefits)

            🎯 **Timeline thực tế:**
            • CV preparation: 1 tuần
            • Apply: 20-30 jobs/tuần
            • Response rate: 10-20%
            • Interview: 2-5 companies song song
            • Offer: 4-8 tuần từ lúc bắt đầu

            ⚡ **Pro Tips:**
            • Apply sớm (trong 24h đầu job posted)
            • Buổi sáng T2-T4 có response rate cao nhất
            • Referral tăng 50% chance (ask friends/LinkedIn)
            • Ghi "Immediate start" nếu đã quit job

            🚫 **Red Flags to avoid:**
            ❌ "We're a family" (translation: OT không lương)
            ❌ JD viết mơ hồ, thiếu tech stack cụ thể
            ❌ Salary "thỏa thuận" (low-ball risk)
            ❌ Reviews Glassdoor < 3.0 stars
            ❌ Hỏi tuổi, tình trạng hôn nhân trong JD

            💡 Bạn đang tìm vị trí gì? Tôi có thể gợi ý companies phù hợp!
            """;
    }

    private String getResumeParsingResponse() {
        return """
            🤖 **Tính năng Resume Analysis AI:**

            Tôi có thể giúp bạn:

            ✨ **Phân tích CV tự động:**
            • Extract skills, experience, education
            • Match với job requirements
            • Tính điểm ATS compatibility
            • Highlight strengths & weaknesses

            📊 **Scoring Criteria:**
            • Format & Structure (20%)
            • Keywords matching (30%)
            • Experience relevance (25%)
            • Skills alignment (25%)

            🎯 **Để sử dụng:**
            Upload CV của bạn tại trang Profile, hoặc gửi link Google Drive/Dropbox

            💡 Bạn có CV cần phân tích không?
            """;
    }

    private String getDefaultResponse() {
        return """
            Cảm ơn bạn đã nhắn tin! 😊

            Tôi là **AI Career Coach** của JobVerse, chuyên tư vấn về:

            🎯 **Định hướng nghề nghiệp** - Roadmap cho từng ngành IT
            📄 **Review CV/Resume** - Tối ưu hóa để pass ATS
            🎤 **Chuẩn bị phỏng vấn** - Technical + HR rounds
            💰 **Tham khảo lương** - Market rates 2025
            📚 **Lộ trình học tập** - Từ zero đến hero
            🔍 **Chiến lược tìm việc** - Apply hiệu quả

            Bạn muốn tôi hỗ trợ về vấn đề gì? Hãy hỏi cụ thể nhé! 💪
            """;
    }

    /**
     * Intent Enum for better code organization
     */
    private enum Intent {
        GREETING,
        CV_REVIEW,
        INTERVIEW_PREP,
        CAREER_ADVICE,
        SALARY_INQUIRY,
        SKILL_LEARNING,
        JOB_SEARCH,
        RESUME_PARSE,
        GENERAL
    }
}
