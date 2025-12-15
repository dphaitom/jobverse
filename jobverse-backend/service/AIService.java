package com.jobverse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;

import java.util.*;

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

    public String chat(String userMessage, String context) {
        // Nếu không có API key, dùng mock responses
        if (apiKey == null || apiKey.isBlank() || !openaiEnabled) {
            return getMockResponse(userMessage);
        }

        try {
            return chatWithOpenAI(userMessage, context);
        } catch (Exception e) {
            // Fallback to mock nếu OpenAI fail
            return getMockResponse(userMessage);
        }
    }

    private String chatWithOpenAI(String userMessage, String context) {
        String systemPrompt = """
            Bạn là AI Career Coach của JobVerse - nền tảng tuyển dụng IT.
            Bạn giúp ứng viên:
            - Tư vấn định hướng nghề nghiệp
            - Review và cải thiện CV
            - Chuẩn bị phỏng vấn
            - Đề xuất việc làm phù hợp
            Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
            """ + (context != null ? "\nThông tin user: " + context : "");

        Map<String, Object> request = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            ),
            "max_tokens", 500,
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

    private String getMockResponse(String userMessage) {
        String msg = userMessage.toLowerCase();

        // Phản hồi dựa trên từ khóa
        if (msg.contains("hello") || msg.contains("hi") || msg.contains("xin chào") || msg.contains("chào")) {
            return "Xin chào! 👋 Tôi là AI Career Coach của JobVerse. Tôi có thể giúp bạn:\n" +
                   "• Tư vấn định hướng nghề nghiệp\n" +
                   "• Review và cải thiện CV\n" +
                   "• Chuẩn bị cho buổi phỏng vấn\n" +
                   "• Đề xuất việc làm phù hợp\n\n" +
                   "Bạn cần hỗ trợ gì hôm nay?";
        }

        if (msg.contains("cv") || msg.contains("resume") || msg.contains("hồ sơ")) {
            return "Để có một CV ấn tượng, bạn nên:\n\n" +
                   "1. **Thông tin liên hệ rõ ràng**: Email, số điện thoại, LinkedIn\n" +
                   "2. **Tóm tắt chuyên nghiệp**: 2-3 câu ngắn gọn về bản thân\n" +
                   "3. **Kinh nghiệm làm việc**: Liệt kê theo thứ tự thời gian, tập trung vào thành tựu\n" +
                   "4. **Kỹ năng kỹ thuật**: Liệt kê công nghệ, ngôn ngữ lập trình bạn thành thạo\n" +
                   "5. **Dự án nổi bật**: Mô tả 2-3 dự án quan trọng nhất\n\n" +
                   "Bạn muốn tôi review CV của bạn không?";
        }

        if (msg.contains("phỏng vấn") || msg.contains("interview")) {
            return "Chuẩn bị phỏng vấn IT hiệu quả:\n\n" +
                   "**Trước phỏng vấn:**\n" +
                   "• Nghiên cứu kỹ về công ty và sản phẩm\n" +
                   "• Ôn lại kiến thức kỹ thuật cơ bản\n" +
                   "• Chuẩn bị câu trả lời cho các câu hỏi phổ biến\n\n" +
                   "**Trong phỏng vấn:**\n" +
                   "• Tự tin nhưng khiêm tốn\n" +
                   "• Giải thích rõ ràng cách giải quyết vấn đề\n" +
                   "• Đặt câu hỏi thông minh về công ty\n\n" +
                   "Bạn cần hỗ trợ về loại phỏng vấn nào? (Technical, HR, hay Coding test?)";
        }

        if (msg.contains("nghề nghiệp") || msg.contains("career") || msg.contains("công việc")) {
            return "Để định hướng nghề nghiệp IT phù hợp:\n\n" +
                   "1. **Đánh giá bản thân**: Kỹ năng hiện tại, sở thích, mục tiêu\n" +
                   "2. **Xu hướng thị trường**: Các công nghệ đang hot (AI/ML, Cloud, DevOps...)\n" +
                   "3. **Roadmap học tập**: Lộ trình cụ thể để đạt mục tiêu\n" +
                   "4. **Kinh nghiệm thực tế**: Làm dự án, contribute open source\n\n" +
                   "Bạn đang quan tâm đến lĩnh vực nào trong IT?";
        }

        if (msg.contains("lương") || msg.contains("salary")) {
            return "Về mức lương trong ngành IT tại Việt Nam:\n\n" +
                   "**Junior (0-2 năm)**: 8-15 triệu\n" +
                   "**Middle (2-5 năm)**: 15-30 triệu\n" +
                   "**Senior (5+ năm)**: 30-60 triệu\n" +
                   "**Tech Lead/Architect**: 60-100+ triệu\n\n" +
                   "Mức lương phụ thuộc vào:\n" +
                   "• Công nghệ/stack bạn sử dụng\n" +
                   "• Quy mô và ngành của công ty\n" +
                   "• Kỹ năng và kinh nghiệm thực tế\n\n" +
                   "Bạn muốn biết mức lương cho vị trí cụ thể nào?";
        }

        if (msg.contains("react") || msg.contains("frontend")) {
            return "React Developer là một trong những vị trí hot nhất!\n\n" +
                   "**Kỹ năng cần có:**\n" +
                   "• React, Redux/Context API\n" +
                   "• JavaScript/TypeScript\n" +
                   "• HTML/CSS, Responsive Design\n" +
                   "• RESTful API, GraphQL\n\n" +
                   "**Lộ trình học:**\n" +
                   "1. JavaScript ES6+\n" +
                   "2. React basics (Components, Hooks, State)\n" +
                   "3. State management (Redux/Zustand)\n" +
                   "4. Build tools (Vite, Webpack)\n\n" +
                   "Tôi có thể gợi ý một số dự án để bạn thực hành nếu bạn muốn!";
        }

        // Default response
        return "Cảm ơn bạn đã nhắn tin! 😊\n\n" +
               "Tôi là AI Career Coach của JobVerse. Tôi có thể giúp bạn về:\n" +
               "• Tư vấn nghề nghiệp IT\n" +
               "• Review CV\n" +
               "• Chuẩn bị phỏng vấn\n" +
               "• Tìm việc làm phù hợp\n\n" +
               "Bạn cần tôi hỗ trợ điều gì cụ thể?";
    }
}