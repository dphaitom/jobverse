package com.jobverse.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Interview Preparation Service
 * Provides mock interview questions, tips, and AI-powered interview coaching
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewPrepService {

    private final AIService aiService;

    /**
     * Generate interview questions based on role and experience level
     */
    public InterviewQuestions generateInterviewQuestions(String role, String experienceLevel, List<String> skills) {
        log.info("Generating interview questions for role: {}, level: {}", role, experienceLevel);

        InterviewQuestions questions = new InterviewQuestions();
        questions.setRole(role);
        questions.setExperienceLevel(experienceLevel);

        // Generate different types of questions
        questions.setHrQuestions(generateHRQuestions(experienceLevel));
        questions.setTechnicalQuestions(generateTechnicalQuestions(role, skills));
        questions.setCodingChallenges(generateCodingChallenges(experienceLevel));
        questions.setBehavioralQuestions(generateBehavioralQuestions(experienceLevel));
        questions.setSystemDesignQuestions(generateSystemDesignQuestions(experienceLevel));

        return questions;
    }

    /**
     * Generate HR round questions
     */
    private List<Question> generateHRQuestions(String level) {
        List<Question> questions = new ArrayList<>();

        // Common for all levels
        questions.add(Question.builder()
            .question("Tell me about yourself")
            .type("HR")
            .difficulty("Easy")
            .tips("Chuẩn bị script 2-3 phút: Background → Current role → Why this company")
            .sampleAnswer("I'm a software engineer with X years of experience in... Currently working at... I'm excited about this opportunity because...")
            .build());

        questions.add(Question.builder()
            .question("Why do you want to work for our company?")
            .type("HR")
            .difficulty("Easy")
            .tips("Research công ty trước, nêu rõ sản phẩm/values bạn thích")
            .sampleAnswer("I've been following your company's product... I'm impressed by... The company values align with...")
            .build());

        questions.add(Question.builder()
            .question("What are your salary expectations?")
            .type("HR")
            .difficulty("Medium")
            .tips("Research market rate trước, đưa range thay vì số cụ thể")
            .sampleAnswer("Based on my experience and market research, I'm looking for a range of X-Y million VND. However, I'm flexible depending on the total package.")
            .build());

        questions.add(Question.builder()
            .question("Where do you see yourself in 5 years?")
            .type("HR")
            .difficulty("Easy")
            .tips("Focus vào growth trong company, align với career path")
            .sampleAnswer("I see myself growing into a [Senior/Lead] role, taking on more responsibilities... contributing to major projects...")
            .build());

        if (level.equalsIgnoreCase("SENIOR") || level.equalsIgnoreCase("MID")) {
            questions.add(Question.builder()
                .question("Describe a time you had a conflict with a team member")
                .type("HR")
                .difficulty("Medium")
                .tips("Dùng STAR method: Situation, Task, Action, Result")
                .sampleAnswer("In my previous role, I had a disagreement about... I initiated a 1-on-1 discussion... We found a compromise... The project was delivered successfully.")
                .build());
        }

        return questions;
    }

    /**
     * Generate technical questions based on role
     */
    private List<Question> generateTechnicalQuestions(String role, List<String> skills) {
        List<Question> questions = new ArrayList<>();
        String roleLower = role.toLowerCase();

        // Frontend questions
        if (roleLower.contains("frontend") || roleLower.contains("react") || roleLower.contains("vue")) {
            questions.add(Question.builder()
                .question("Explain the Virtual DOM and how React uses it")
                .type("Technical")
                .difficulty("Medium")
                .tips("Giải thích: Virtual DOM là bản copy nhẹ của DOM thật, React dùng diffing algorithm để update hiệu quả")
                .sampleAnswer("Virtual DOM is a lightweight representation of the real DOM. React uses it to optimize updates by: 1) Creating a virtual tree, 2) Comparing with previous version (diffing), 3) Updating only changed parts")
                .build());

            questions.add(Question.builder()
                .question("What are React Hooks? Explain useState and useEffect")
                .type("Technical")
                .difficulty("Easy")
                .tips("Hooks cho phép dùng state và lifecycle trong functional components")
                .sampleAnswer("Hooks are functions that let you use state and lifecycle features in functional components. useState manages component state, useEffect handles side effects like API calls or subscriptions.")
                .build());

            questions.add(Question.builder()
                .question("How would you optimize a React application's performance?")
                .type("Technical")
                .difficulty("Hard")
                .tips("Nêu: Code splitting, lazy loading, memoization (React.memo, useMemo), virtual scrolling")
                .sampleAnswer("I would: 1) Use React.memo for expensive components, 2) Implement code splitting with React.lazy, 3) Use useMemo/useCallback for expensive computations, 4) Optimize re-renders with proper key props")
                .build());
        }

        // Backend questions
        if (roleLower.contains("backend") || roleLower.contains("java") || roleLower.contains("spring")) {
            questions.add(Question.builder()
                .question("Explain the difference between @Component, @Service, and @Repository in Spring")
                .type("Technical")
                .difficulty("Easy")
                .tips("Tất cả đều là @Component, nhưng có semantic khác nhau cho layers")
                .sampleAnswer("All three are specializations of @Component. @Service indicates business logic layer, @Repository indicates data access layer (with exception translation), @Component is generic.")
                .build());

            questions.add(Question.builder()
                .question("How does JPA/Hibernate handle N+1 query problem?")
                .type("Technical")
                .difficulty("Medium")
                .tips("N+1 xảy ra khi load related entities. Fix: JOIN FETCH, EntityGraph, Batch fetching")
                .sampleAnswer("N+1 occurs when fetching entities with lazy-loaded associations. Solutions: 1) Use JOIN FETCH in JPQL, 2) @EntityGraph annotation, 3) Enable batch fetching, 4) Use DTOs with custom queries")
                .build());

            questions.add(Question.builder()
                .question("Explain REST API design principles")
                .type("Technical")
                .difficulty("Medium")
                .tips("Stateless, Resource-based URLs, HTTP methods, Status codes")
                .sampleAnswer("Key principles: 1) Stateless communication, 2) Resource-based URLs (/users/123), 3) Proper HTTP verbs (GET/POST/PUT/DELETE), 4) Meaningful status codes, 5) Versioning, 6) HATEOAS for discoverability")
                .build());
        }

        // Database questions
        if (skills.contains("SQL") || skills.contains("PostgreSQL") || skills.contains("MongoDB")) {
            questions.add(Question.builder()
                .question("Explain database indexing and when to use it")
                .type("Technical")
                .difficulty("Medium")
                .tips("Index tăng tốc SELECT nhưng chậm INSERT/UPDATE. Dùng cho frequently queried columns")
                .sampleAnswer("Indexes speed up SELECT queries by creating a data structure (B-tree) for fast lookups. Use on: 1) Foreign keys, 2) WHERE clause columns, 3) ORDER BY columns. Trade-off: slower writes, more storage")
                .build());

            questions.add(Question.builder()
                .question("What is database normalization? Explain 1NF, 2NF, 3NF")
                .type("Technical")
                .difficulty("Hard")
                .tips("Normalization giảm redundancy. 1NF: atomic values, 2NF: no partial dependency, 3NF: no transitive dependency")
                .sampleAnswer("Normalization organizes data to reduce redundancy. 1NF: atomic values, no repeating groups. 2NF: 1NF + no partial dependencies. 3NF: 2NF + no transitive dependencies")
                .build());
        }

        // Add general technical questions
        questions.add(Question.builder()
            .question("Explain the CAP theorem")
            .type("Technical")
            .difficulty("Hard")
            .tips("Consistency, Availability, Partition tolerance - chỉ pick được 2/3")
            .sampleAnswer("CAP states distributed systems can only guarantee 2 of 3: Consistency (all nodes see same data), Availability (system remains operational), Partition tolerance (works despite network failures)")
            .build());

        return questions;
    }

    /**
     * Generate coding challenges
     */
    private List<Question> generateCodingChallenges(String level) {
        List<Question> challenges = new ArrayList<>();

        if (level.equalsIgnoreCase("JUNIOR") || level.equalsIgnoreCase("INTERNSHIP")) {
            challenges.add(Question.builder()
                .question("Reverse a string without using built-in methods")
                .type("Coding")
                .difficulty("Easy")
                .tips("Dùng two pointers hoặc StringBuilder")
                .sampleAnswer("```java\nString reverse(String s) {\n  char[] chars = s.toCharArray();\n  int l = 0, r = chars.length - 1;\n  while (l < r) {\n    char temp = chars[l];\n    chars[l++] = chars[r];\n    chars[r--] = temp;\n  }\n  return new String(chars);\n}\n```")
                .build());

            challenges.add(Question.builder()
                .question("Find the first non-repeating character in a string")
                .type("Coding")
                .difficulty("Easy")
                .tips("Dùng HashMap để đếm frequency, sau đó iterate lại")
                .sampleAnswer("```java\nchar firstUnique(String s) {\n  Map<Character, Integer> freq = new HashMap<>();\n  for (char c : s.toCharArray()) freq.put(c, freq.getOrDefault(c, 0) + 1);\n  for (char c : s.toCharArray()) if (freq.get(c) == 1) return c;\n  return '\\0';\n}\n```")
                .build());
        }

        challenges.add(Question.builder()
            .question("Two Sum: Find two numbers in array that sum to target")
            .type("Coding")
            .difficulty("Easy")
            .tips("Dùng HashMap để track seen numbers, O(n) time")
            .sampleAnswer("```java\nint[] twoSum(int[] nums, int target) {\n  Map<Integer, Integer> map = new HashMap<>();\n  for (int i = 0; i < nums.length; i++) {\n    int complement = target - nums[i];\n    if (map.containsKey(complement)) return new int[] {map.get(complement), i};\n    map.put(nums[i], i);\n  }\n  return new int[] {};\n}\n```")
            .build());

        if (!level.equalsIgnoreCase("INTERNSHIP")) {
            challenges.add(Question.builder()
                .question("Implement LRU Cache with O(1) get and put")
                .type("Coding")
                .difficulty("Medium")
                .tips("Dùng HashMap + Doubly Linked List")
                .sampleAnswer("```java\nclass LRUCache {\n  Map<Integer, Node> cache;\n  DoublyLinkedList list;\n  int capacity;\n  \n  // Implementation using HashMap + DLL\n}\n```")
                .build());
        }

        if (level.equalsIgnoreCase("SENIOR")) {
            challenges.add(Question.builder()
                .question("Design a data structure that supports insert, delete, getRandom in O(1)")
                .type("Coding")
                .difficulty("Hard")
                .tips("Combine ArrayList (for random access) + HashMap (for O(1) lookup)")
                .sampleAnswer("```java\nclass RandomizedSet {\n  List<Integer> list;\n  Map<Integer, Integer> map; // value -> index\n  Random rand = new Random();\n}\n```")
                .build());
        }

        return challenges;
    }

    /**
     * Generate behavioral questions
     */
    private List<Question> generateBehavioralQuestions(String level) {
        List<Question> questions = new ArrayList<>();

        questions.add(Question.builder()
            .question("Tell me about a challenging project you worked on")
            .type("Behavioral")
            .difficulty("Medium")
            .tips("Dùng STAR: Situation, Task, Action, Result. Focus vào impact")
            .sampleAnswer("In my previous role, we faced [situation]... I was responsible for [task]... I took these actions: 1)... 2)... Result: improved performance by 40%, reduced bugs by 30%")
            .build());

        questions.add(Question.builder()
            .question("How do you handle tight deadlines?")
            .type("Behavioral")
            .difficulty("Easy")
            .tips("Nêu: prioritization, communication, time management")
            .sampleAnswer("I prioritize tasks by impact, break down work into milestones, communicate proactively with stakeholders, and focus on delivering MVP first")
            .build());

        if (!level.equalsIgnoreCase("INTERNSHIP")) {
            questions.add(Question.builder()
                .question("Describe a time you had to learn a new technology quickly")
                .type("Behavioral")
                .difficulty("Medium")
                .tips("Show learning ability, resourcefulness")
                .sampleAnswer("When our team decided to migrate to Kubernetes, I had 2 weeks to learn it. I: 1) Completed official tutorials, 2) Built a demo project, 3) Read case studies, 4) Pair-programmed with experienced colleague")
                .build());

            questions.add(Question.builder()
                .question("How do you handle code reviews and feedback?")
                .type("Behavioral")
                .difficulty("Easy")
                .tips("Show open-mindedness, growth mindset")
                .sampleAnswer("I view code reviews as learning opportunities. I appreciate constructive feedback, ask questions to understand suggestions, and apply learnings to future code")
                .build());
        }

        return questions;
    }

    /**
     * Generate system design questions
     */
    private List<Question> generateSystemDesignQuestions(String level) {
        List<Question> questions = new ArrayList<>();

        if (level.equalsIgnoreCase("JUNIOR") || level.equalsIgnoreCase("INTERNSHIP")) {
            questions.add(Question.builder()
                .question("Design a simple URL shortener")
                .type("System Design")
                .difficulty("Easy")
                .tips("Components: URL shortening logic, database, redirect service")
                .sampleAnswer("1) Hash function to generate short URL, 2) Database (key-value store) mapping short->long, 3) Redirect service, 4) Consider: collision handling, expiration")
                .build());
        } else if (level.equalsIgnoreCase("MID")) {
            questions.add(Question.builder()
                .question("Design a rate limiter")
                .type("System Design")
                .difficulty("Medium")
                .tips("Algorithms: Token bucket, Leaky bucket, Fixed/Sliding window")
                .sampleAnswer("Approach: 1) Choose algorithm (token bucket for burst, sliding window for precision), 2) Storage (Redis for distributed), 3) Key design (user_id:endpoint), 4) Handle edge cases")
                .build());

            questions.add(Question.builder()
                .question("Design a notification system")
                .type("System Design")
                .difficulty("Medium")
                .tips("Consider: Multiple channels (push, email, SMS), scalability, prioritization")
                .sampleAnswer("Components: 1) Notification service, 2) Queue (Kafka/RabbitMQ), 3) Workers for each channel, 4) User preferences DB, 5) Template service, 6) Analytics")
                .build());
        } else { // SENIOR
            questions.add(Question.builder()
                .question("Design Twitter/Facebook News Feed")
                .type("System Design")
                .difficulty("Hard")
                .tips("Focus: Fan-out strategies, caching, ranking algorithm")
                .sampleAnswer("1) Fan-out on write vs read trade-offs, 2) Cache layer (Redis) for hot users, 3) Ranking algorithm (recency, engagement), 4) Sharding strategy, 5) CDN for media")
                .build());

            questions.add(Question.builder()
                .question("Design a distributed job scheduler")
                .type("System Design")
                .difficulty("Hard")
                .tips("Consider: Consistency, fault tolerance, priority queues")
                .sampleAnswer("Components: 1) Distributed queue (Kafka), 2) Coordinator (Zookeeper), 3) Worker pool, 4) Retry mechanism, 5) Monitoring, 6) Handle failures with dead letter queue")
                .build());
        }

        return questions;
    }

    /**
     * Get AI-powered answer evaluation
     */
    public AnswerEvaluation evaluateAnswer(String question, String userAnswer) {
        String context = "User is practicing interview. Question: " + question + "\nUser's answer: " + userAnswer;

        String aiEvaluation = aiService.chat(
            "Đánh giá câu trả lời phỏng vấn này và cho feedback (bằng tiếng Việt, ngắn gọn):\n\n" +
            "Câu hỏi: " + question + "\n" +
            "Trả lời: " + userAnswer,
            context
        );

        return AnswerEvaluation.builder()
            .question(question)
            .userAnswer(userAnswer)
            .feedback(aiEvaluation)
            .build();
    }

    /**
     * Get interview tips
     */
    public List<String> getInterviewTips(String interviewType) {
        List<String> tips = new ArrayList<>();

        switch (interviewType.toUpperCase()) {
            case "TECHNICAL":
                tips.add("💡 Think out loud - Interviewer muốn biết thought process của bạn");
                tips.add("🔍 Clarify requirements trước khi code - Hỏi về constraints, edge cases");
                tips.add("⚡ Start with brute force, then optimize - Giải thích trade-offs");
                tips.add("🧪 Test your code - Walk through test cases, including edge cases");
                tips.add("📝 Write clean code - Proper variable names, organized structure");
                break;

            case "HR":
                tips.add("😊 Be authentic but professional - Không cần perfect, cần genuine");
                tips.add("📚 Research the company - Website, products, recent news, values");
                tips.add("🎯 Prepare stories - 3-5 STAR stories covering different situations");
                tips.add("❓ Ask thoughtful questions - Shows interest and preparation");
                tips.add("💪 Show enthusiasm - Energy và passion for the role");
                break;

            case "SYSTEM_DESIGN":
                tips.add("📊 Clarify requirements - Functional và non-functional requirements");
                tips.add("🔢 Estimate scale - Users, requests/day, storage, bandwidth");
                tips.add("🏗️ High-level design first - Components và interactions trước khi deep dive");
                tips.add("⚖️ Discuss trade-offs - CAP theorem, consistency vs availability");
                tips.add("📈 Bottlenecks và scaling - Identify và address potential issues");
                break;

            default:
                tips.add("🕐 Arrive 10-15 minutes early");
                tips.add("👔 Dress appropriately for company culture");
                tips.add("💬 Practice common questions beforehand");
                tips.add("📱 Turn off phone completely");
                tips.add("🤝 Follow up with thank-you email within 24h");
        }

        return tips;
    }

    // DTOs

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class Question {
        private String question;
        private String type;
        private String difficulty;
        private String tips;
        private String sampleAnswer;
    }

    @lombok.Data
    public static class InterviewQuestions {
        private String role;
        private String experienceLevel;
        private List<Question> hrQuestions = new ArrayList<>();
        private List<Question> technicalQuestions = new ArrayList<>();
        private List<Question> codingChallenges = new ArrayList<>();
        private List<Question> behavioralQuestions = new ArrayList<>();
        private List<Question> systemDesignQuestions = new ArrayList<>();
    }

    @lombok.Data
    @lombok.Builder
    public static class AnswerEvaluation {
        private String question;
        private String userAnswer;
        private String feedback;
        private Integer score;
    }
}
