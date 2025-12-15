package com.jobverse.service;

import com.jobverse.dto.response.JobResponse;
import com.jobverse.entity.Job;
import com.jobverse.entity.User;
import com.jobverse.entity.UserSkill;
import com.jobverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIMatchingService {
    
    private final UserRepository userRepository;
    
    /**
     * Calculate match score between a user and a job
     */
    public JobResponse.MatchAnalysis calculateMatchScore(Long userId, Job job) {
        User user = userRepository.findByIdWithProfile(userId).orElse(null);
        if (user == null) return null;
        
        // Get user skills
        Set<String> userSkillNames = user.getSkills().stream()
                .map(us -> us.getSkill().getName().toLowerCase())
                .collect(Collectors.toSet());
        
        // Get job required skills
        Set<String> jobSkillNames = job.getSkills().stream()
                .map(js -> js.getSkill().getName().toLowerCase())
                .collect(Collectors.toSet());
        
        // Calculate skill match
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        
        for (String jobSkill : jobSkillNames) {
            if (userSkillNames.contains(jobSkill)) {
                matchedSkills.add(jobSkill);
            } else {
                missingSkills.add(jobSkill);
            }
        }
        
        int skillMatch = jobSkillNames.isEmpty() ? 100 : 
                (int) ((matchedSkills.size() * 100.0) / jobSkillNames.size());
        
        // Calculate experience match
        int experienceMatch = calculateExperienceMatch(user, job);
        
        // Calculate salary match
        int salaryMatch = calculateSalaryMatch(user, job);
        
        // Calculate location match
        int locationMatch = calculateLocationMatch(user, job);
        
        // Generate recommendations
        List<String> recommendations = generateRecommendations(missingSkills, experienceMatch, salaryMatch);
        
        return JobResponse.MatchAnalysis.builder()
                .skillMatch(skillMatch)
                .experienceMatch(experienceMatch)
                .salaryMatch(salaryMatch)
                .locationMatch(locationMatch)
                .matchedSkills(matchedSkills)
                .missingSkills(missingSkills)
                .recommendations(recommendations)
                .build();
    }
    
    private int calculateExperienceMatch(User user, Job job) {
        if (user.getProfile() == null || user.getProfile().getExperienceYears() == null) {
            return 50; // Default if no experience info
        }
        
        int userExp = user.getProfile().getExperienceYears();
        
        // Map experience level to years
        int requiredExp = switch (job.getExperienceLevel()) {
            case ENTRY -> 0;
            case JUNIOR -> 1;
            case MID -> 3;
            case SENIOR -> 5;
            case LEAD -> 7;
            case MANAGER -> 8;
            case DIRECTOR -> 10;
        };
        
        if (userExp >= requiredExp) {
            return 100;
        } else if (userExp >= requiredExp - 1) {
            return 80;
        } else if (userExp >= requiredExp - 2) {
            return 60;
        }
        return 40;
    }
    
    private int calculateSalaryMatch(User user, Job job) {
        if (user.getProfile() == null || 
            user.getProfile().getExpectedSalaryMin() == null ||
            job.getSalaryMax() == null) {
            return 70; // Default
        }
        
        var expectedMin = user.getProfile().getExpectedSalaryMin();
        var jobMax = job.getSalaryMax();
        
        if (jobMax.compareTo(expectedMin) >= 0) {
            return 100;
        }
        
        // Calculate percentage
        double ratio = jobMax.doubleValue() / expectedMin.doubleValue();
        return (int) Math.min(ratio * 100, 100);
    }
    
    private int calculateLocationMatch(User user, Job job) {
        if (job.getIsRemote() != null && job.getIsRemote()) {
            return 100; // Remote job matches everyone
        }
        
        if (user.getProfile() == null || user.getProfile().getCity() == null) {
            return 70; // Default
        }
        
        String userCity = user.getProfile().getCity().toLowerCase();
        String jobLocation = job.getLocation().toLowerCase();
        
        if (jobLocation.contains(userCity) || userCity.contains(jobLocation)) {
            return 100;
        }
        
        // Check if user is open to remote
        if (user.getProfile().getOpenToRemote() != null && user.getProfile().getOpenToRemote()) {
            return 80;
        }
        
        return 50;
    }
    
    private List<String> generateRecommendations(List<String> missingSkills, 
                                                   int experienceMatch, 
                                                   int salaryMatch) {
        List<String> recommendations = new ArrayList<>();
        
        if (!missingSkills.isEmpty()) {
            recommendations.add("Học thêm các kỹ năng: " + String.join(", ", missingSkills.subList(0, Math.min(3, missingSkills.size()))));
        }
        
        if (experienceMatch < 70) {
            recommendations.add("Tích lũy thêm kinh nghiệm làm việc trong lĩnh vực liên quan");
        }
        
        if (salaryMatch < 70) {
            recommendations.add("Điều chỉnh kỳ vọng lương phù hợp với thị trường");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Hồ sơ của bạn rất phù hợp với vị trí này!");
        }
        
        return recommendations;
    }
}
