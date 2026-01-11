package com.jobverse.dto.response;

import com.jobverse.entity.CompanyReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyReviewResponse {
    
    private Long id;
    private Long companyId;
    private String companyName;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String title;
    private String pros;
    private String cons;
    private Boolean isCurrentEmployee;
    private String jobTitle;
    private String status;
    private LocalDateTime createdAt;
    
    public static CompanyReviewResponse fromEntity(CompanyReview review) {
        if (review == null) return null;
        
        String userName = "Ẩn danh";
        String userAvatar = null;
        
        if (review.getUser() != null) {
            if (review.getUser().getProfile() != null && review.getUser().getProfile().getFullName() != null) {
                userName = review.getUser().getProfile().getFullName();
                userAvatar = review.getUser().getProfile().getAvatarUrl();
            } else {
                // Fallback to email prefix if no profile name
                userName = review.getUser().getEmail().split("@")[0];
            }
        }
        
        return CompanyReviewResponse.builder()
                .id(review.getId())
                .companyId(review.getCompany() != null ? review.getCompany().getId() : null)
                .companyName(review.getCompany() != null ? review.getCompany().getName() : null)
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(userName)
                .userAvatar(userAvatar)
                .rating(review.getRating())
                .title(review.getTitle())
                .pros(review.getPros())
                .cons(review.getCons())
                .isCurrentEmployee(review.getIsCurrentEmployee())
                .jobTitle(review.getJobTitle())
                .status(review.getStatus() != null ? review.getStatus().name() : null)
                .createdAt(review.getCreatedAt())
                .build();
    }
}
