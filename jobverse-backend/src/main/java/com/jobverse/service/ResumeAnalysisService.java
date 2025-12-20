package com.jobverse.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Resume Analysis Service
 * Analyzes resumes and provides AI-powered insights, scoring, and recommendations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeAnalysisService {

    /**
     * Analyze a resume and return comprehensive analysis
     */
    public ResumeAnalysisResult analyzeResume(String resumeText) {
        log.info("Analyzing resume (length: {} chars)", resumeText.length());

        ResumeAnalysisResult result = new ResumeAnalysisResult();

        // Extract information
        result.setSkills(extractSkills(resumeText));
        result.setExperience(extractExperience(resumeText));
        result.setEducation(extractEducation(resumeText));
        result.setContactInfo(extractContactInfo(resumeText));

        // Calculate scores
        result.setAtsScore(calculateATSScore(resumeText, result));
        result.setContentScore(calculateContentScore(resumeText, result));
        result.setFormatScore(calculateFormatScore(resumeText));

        // Overall score (weighted average)
        int overallScore = (int) Math.round(
            result.getAtsScore() * 0.4 +
            result.getContentScore() * 0.3 +
            result.getFormatScore() * 0.3
        );
        result.setOverallScore(overallScore);

        // Generate recommendations
        result.setRecommendations(generateRecommendations(result));

        // Generate insights
        result.setInsights(generateInsights(result));

        log.info("Resume analysis complete. Overall score: {}", overallScore);

        return result;
    }

    /**
     * Extract skills from resume
     */
    private List<String> extractSkills(String text) {
        // Common tech skills to look for
        Set<String> knownSkills = new HashSet<>(Arrays.asList(
            "Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
            "React", "Vue", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte",
            "Node.js", "Express", "Spring", "Spring Boot", "Django", "Flask", "FastAPI",
            "HTML", "CSS", "Tailwind", "TailwindCSS", "Bootstrap", "SASS", "SCSS",
            "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Jenkins",
            "Git", "GitHub", "GitLab", "Bitbucket",
            "React Native", "Flutter", "Swift", "Kotlin", "Android", "iOS",
            "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
            "GraphQL", "REST", "API", "Microservices", "CI/CD", "DevOps",
            "Agile", "Scrum", "Jira", "Confluence"
        ));

        List<String> foundSkills = new ArrayList<>();
        String lowerText = text.toLowerCase();

        for (String skill : knownSkills) {
            if (lowerText.contains(skill.toLowerCase())) {
                foundSkills.add(skill);
            }
        }

        return foundSkills;
    }

    /**
     * Extract years of experience
     */
    private Integer extractExperience(String text) {
        Pattern pattern = Pattern.compile("(\\d+)\\+?\\s*(years?|năm)\\s*(of\\s*)?(experience|kinh nghiệm)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        // Count work experience sections
        Pattern workPattern = Pattern.compile("(?i)(\\d{4})\\s*[-–—]\\s*(\\d{4}|present|current|hiện tại)");
        Matcher workMatcher = workPattern.matcher(text);

        int totalYears = 0;
        while (workMatcher.find()) {
            int startYear = Integer.parseInt(workMatcher.group(1));
            String endYearStr = workMatcher.group(2);

            int endYear = endYearStr.matches("\\d+") ?
                Integer.parseInt(endYearStr) :
                Calendar.getInstance().get(Calendar.YEAR);

            totalYears += Math.max(0, endYear - startYear);
        }

        return totalYears > 0 ? totalYears : null;
    }

    /**
     * Extract education information
     */
    private String extractEducation(String text) {
        String[] degrees = {"PhD", "Ph.D", "Master", "Bachelor", "Đại học", "Thạc sĩ", "Tiến sĩ", "Cử nhân"};

        for (String degree : degrees) {
            Pattern pattern = Pattern.compile("(" + degree + "[^\\n]{0,100})", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {
                return matcher.group(1).trim();
            }
        }

        return null;
    }

    /**
     * Extract contact information
     */
    private Map<String, String> extractContactInfo(String text) {
        Map<String, String> contact = new HashMap<>();

        // Email
        Pattern emailPattern = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
        Matcher emailMatcher = emailPattern.matcher(text);
        if (emailMatcher.find()) {
            contact.put("email", emailMatcher.group());
        }

        // Phone
        Pattern phonePattern = Pattern.compile("(?:\\+84|0)\\s?\\d{9,10}");
        Matcher phoneMatcher = phonePattern.matcher(text);
        if (phoneMatcher.find()) {
            contact.put("phone", phoneMatcher.group());
        }

        // LinkedIn
        Pattern linkedinPattern = Pattern.compile("linkedin\\.com/in/([a-zA-Z0-9-]+)");
        Matcher linkedinMatcher = linkedinPattern.matcher(text);
        if (linkedinMatcher.find()) {
            contact.put("linkedin", linkedinMatcher.group(0));
        }

        // GitHub
        Pattern githubPattern = Pattern.compile("github\\.com/([a-zA-Z0-9-]+)");
        Matcher githubMatcher = githubPattern.matcher(text);
        if (githubMatcher.find()) {
            contact.put("github", githubMatcher.group(0));
        }

        return contact;
    }

    /**
     * Calculate ATS (Applicant Tracking System) compatibility score
     */
    private int calculateATSScore(String text, ResumeAnalysisResult partial) {
        int score = 100;

        // Check for common ATS-unfriendly elements
        if (text.contains("│") || text.contains("┌") || text.contains("└")) {
            score -= 20; // Special characters
        }

        if (text.split("\\n").length < 10) {
            score -= 15; // Too short
        }

        if (partial.getContactInfo().isEmpty()) {
            score -= 20; // Missing contact info
        }

        if (partial.getSkills().isEmpty()) {
            score -= 25; // No skills found
        }

        if (partial.getExperience() == null) {
            score -= 10; // Experience not clear
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate content quality score
     */
    private int calculateContentScore(String text, ResumeAnalysisResult partial) {
        int score = 50; // Base score

        // Skills count
        int skillCount = partial.getSkills().size();
        score += Math.min(25, skillCount * 2);

        // Has education
        if (partial.getEducation() != null) {
            score += 10;
        }

        // Has experience
        if (partial.getExperience() != null && partial.getExperience() > 0) {
            score += 15;
        }

        // Length check (not too short, not too long)
        int wordCount = text.split("\\s+").length;
        if (wordCount >= 200 && wordCount <= 800) {
            score += 10;
        }

        // Has quantifiable achievements (numbers)
        Pattern numberPattern = Pattern.compile("\\d+%|\\d+\\+|\\d{3,}");
        Matcher numberMatcher = numberPattern.matcher(text);
        int numberCount = 0;
        while (numberMatcher.find() && numberCount < 5) {
            numberCount++;
            score += 2;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate format quality score
     */
    private int calculateFormatScore(String text) {
        int score = 80; // Start high

        // Check for sections
        String[] sections = {"experience", "education", "skills", "projects", "kinh nghiệm", "học vấn", "kỹ năng", "dự án"};
        int sectionCount = 0;
        for (String section : sections) {
            if (text.toLowerCase().contains(section)) {
                sectionCount++;
            }
        }

        if (sectionCount < 2) {
            score -= 30; // Poor structure
        } else if (sectionCount >= 3) {
            score += 10; // Good structure
        }

        // Check for bullet points
        if (text.contains("•") || text.contains("-") || text.contains("*")) {
            score += 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate personalized recommendations
     */
    private List<String> generateRecommendations(ResumeAnalysisResult result) {
        List<String> recommendations = new ArrayList<>();

        // ATS recommendations
        if (result.getAtsScore() < 70) {
            recommendations.add("🔧 Cải thiện ATS compatibility: Sử dụng format đơn giản, tránh bảng và hình ảnh phức tạp");
        }

        // Skills recommendations
        if (result.getSkills().size() < 5) {
            recommendations.add("💡 Thêm kỹ năng: Liệt kê đầy đủ technical skills (ngôn ngữ, frameworks, tools)");
        }

        // Experience recommendations
        if (result.getExperience() == null || result.getExperience() == 0) {
            recommendations.add("📊 Làm rõ kinh nghiệm: Thêm timeline cụ thể (MM/YYYY - MM/YYYY) cho từng vị trí");
        }

        // Contact recommendations
        if (!result.getContactInfo().containsKey("linkedin")) {
            recommendations.add("🔗 Thêm LinkedIn profile URL để tăng uy tín");
        }

        if (!result.getContactInfo().containsKey("github")) {
            recommendations.add("💻 Thêm GitHub profile để showcase projects (quan trọng với dev)");
        }

        // Content recommendations
        if (result.getContentScore() < 70) {
            recommendations.add("✍️ Bổ sung thành tích đo lường được (VD: 'Tăng performance 40%', '10K+ users')");
        }

        // Format recommendations
        if (result.getFormatScore() < 70) {
            recommendations.add("📝 Cải thiện cấu trúc: Chia rõ sections (Experience, Education, Skills, Projects)");
        }

        // General recommendations
        if (result.getOverallScore() >= 80) {
            recommendations.add("🎉 CV của bạn rất tốt! Chỉ cần polish nhỏ là có thể apply");
        } else if (result.getOverallScore() >= 60) {
            recommendations.add("✅ CV đang ổn, nhưng còn nhiều room để improve theo gợi ý trên");
        } else {
            recommendations.add("⚠️ CV cần cải thiện đáng kể. Hãy focus vào việc làm rõ skills và experience");
        }

        return recommendations;
    }

    /**
     * Generate insights about the resume
     */
    private List<String> generateInsights(ResumeAnalysisResult result) {
        List<String> insights = new ArrayList<>();

        // Experience level insight
        Integer exp = result.getExperience();
        if (exp != null) {
            if (exp < 2) {
                insights.add("📌 Junior level - Phù hợp với vị trí Junior/Entry-level");
            } else if (exp < 5) {
                insights.add("📌 Mid level - Có thể apply vị trí Middle hoặc Senior (với skills đủ mạnh)");
            } else {
                insights.add("📌 Senior level - Có thể target vị trí Senior, Lead, hoặc Architect");
            }
        }

        // Skills insight
        List<String> skills = result.getSkills();
        if (skills.size() >= 10) {
            insights.add("💪 Skill set đa dạng - Phù hợp với Full-stack hoặc Multi-platform roles");
        }

        // Tech stack insight
        boolean hasFrontend = skills.stream().anyMatch(s ->
            s.equalsIgnoreCase("React") || s.equalsIgnoreCase("Vue.js") || s.equalsIgnoreCase("Angular")
        );
        boolean hasBackend = skills.stream().anyMatch(s ->
            s.equalsIgnoreCase("Java") || s.equalsIgnoreCase("Node.js") || s.equalsIgnoreCase("Python")
        );

        if (hasFrontend && hasBackend) {
            insights.add("🌟 Full-stack profile - Có lợi thế ở các startups/SMEs");
        } else if (hasFrontend) {
            insights.add("🎨 Frontend specialist - Phù hợp với UI-focused roles");
        } else if (hasBackend) {
            insights.add("⚙️ Backend specialist - Phù hợp với API/System design roles");
        }

        // Cloud insight
        boolean hasCloud = skills.stream().anyMatch(s ->
            s.equalsIgnoreCase("AWS") || s.equalsIgnoreCase("Azure") || s.equalsIgnoreCase("GCP")
        );
        if (hasCloud) {
            insights.add("☁️ Cloud experience - Hot skill, có thể apply DevOps/Cloud Engineer roles");
        }

        return insights;
    }

    /**
     * Compare resume against job requirements
     */
    public MatchResult matchResumeToJob(ResumeAnalysisResult resume, Set<String> jobRequiredSkills) {
        Set<String> resumeSkills = new HashSet<>(resume.getSkills());
        Set<String> matchedSkills = new HashSet<>(resumeSkills);
        matchedSkills.retainAll(jobRequiredSkills);

        Set<String> missingSkills = new HashSet<>(jobRequiredSkills);
        missingSkills.removeAll(resumeSkills);

        int matchPercentage = jobRequiredSkills.isEmpty() ? 0 :
            (int) Math.round((matchedSkills.size() * 100.0) / jobRequiredSkills.size());

        return MatchResult.builder()
            .matchPercentage(matchPercentage)
            .matchedSkills(new ArrayList<>(matchedSkills))
            .missingSkills(new ArrayList<>(missingSkills))
            .build();
    }

    // DTOs

    @lombok.Data
    public static class ResumeAnalysisResult {
        private int overallScore;
        private int atsScore;
        private int contentScore;
        private int formatScore;

        private List<String> skills = new ArrayList<>();
        private Integer experience;
        private String education;
        private Map<String, String> contactInfo = new HashMap<>();

        private List<String> recommendations = new ArrayList<>();
        private List<String> insights = new ArrayList<>();
    }

    @lombok.Data
    @lombok.Builder
    public static class MatchResult {
        private int matchPercentage;
        private List<String> matchedSkills;
        private List<String> missingSkills;
    }
}
