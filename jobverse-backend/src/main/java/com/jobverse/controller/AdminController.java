package com.jobverse.controller;

import com.jobverse.dto.response.ApiResponse;
import com.jobverse.entity.Job;
import com.jobverse.entity.User;
import com.jobverse.repository.ApplicationRepository;
import com.jobverse.repository.CompanyRepository;
import com.jobverse.repository.JobRepository;
import com.jobverse.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin Panel Controller
 * Provides APIs for admin dashboard, user management, job approval, and statistics
 */
@Slf4j
@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin panel management APIs")
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;

    /**
     * Get dashboard statistics
     */
    @GetMapping("/stats")
    @Operation(summary = "Get dashboard stats", description = "Get overall platform statistics for admin dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        log.info("📊 Admin: Fetching dashboard statistics");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeJobs", jobRepository.countByStatus(Job.JobStatus.APPROVED));
        stats.put("totalCompanies", companyRepository.count());
        stats.put("totalApplications", applicationRepository.count());
        stats.put("pendingJobs", jobRepository.countByStatus(Job.JobStatus.PENDING));
        stats.put("monthlyRevenue", 0); // Placeholder for future implementation

        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved", stats));
    }

    /**
     * Get recent jobs
     */
    @GetMapping("/jobs/recent")
    @Operation(summary = "Get recent jobs", description = "Get recently created jobs")
    public ResponseEntity<ApiResponse<Page<Job>>> getRecentJobs(Pageable pageable) {
        log.info("📝 Admin: Fetching recent jobs");
        Page<Job> jobs = jobRepository.findAllByOrderByCreatedAtDesc(pageable);
        return ResponseEntity.ok(ApiResponse.success("Recent jobs retrieved", jobs));
    }

    /**
     * Get recent users
     */
    @GetMapping("/users/recent")
    @Operation(summary = "Get recent users", description = "Get recently registered users")
    public ResponseEntity<ApiResponse<Page<User>>> getRecentUsers(Pageable pageable) {
        log.info("👥 Admin: Fetching recent users");
        Page<User> users = userRepository.findAllByOrderByCreatedAtDesc(pageable);
        return ResponseEntity.ok(ApiResponse.success("Recent users retrieved", users));
    }

    /**
     * Get all users with filters
     */
    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Get paginated list of all users with optional filters")
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(required = false) User.Role role,
            @RequestParam(required = false) User.Status status,
            Pageable pageable
    ) {
        log.info("👥 Admin: Fetching users - role: {}, status: {}", role, status);

        Page<User> users;
        if (role != null && status != null) {
            users = userRepository.findByRoleAndStatus(role, status, pageable);
        } else if (role != null) {
            users = userRepository.findByRole(role, pageable);
        } else if (status != null) {
            users = userRepository.findByStatus(status, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    /**
     * Ban/Unban user
     */
    @PutMapping("/users/{id}/ban")
    @Operation(summary = "Ban/Unban user", description = "Toggle user ban status")
    public ResponseEntity<ApiResponse<User>> toggleUserBan(@PathVariable Long id) {
        log.info("🔨 Admin: Toggling ban status for user {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Toggle between ACTIVE and BANNED
        if (user.getStatus() == User.Status.BANNED) {
            user.setStatus(User.Status.ACTIVE);
        } else {
            user.setStatus(User.Status.BANNED);
        }
        userRepository.save(user);

        String action = user.getStatus() == User.Status.ACTIVE ? "unbanned" : "banned";
        log.info("✅ Admin: User {} {}", id, action);

        return ResponseEntity.ok(ApiResponse.success("User " + action + " successfully", user));
    }

    /**
     * Get pending jobs for approval
     */
    @GetMapping("/jobs/pending")
    @Operation(summary = "Get pending jobs", description = "Get jobs waiting for approval")
    public ResponseEntity<ApiResponse<Page<Job>>> getPendingJobs(Pageable pageable) {
        log.info("⏳ Admin: Fetching pending jobs");
        Page<Job> jobs = jobRepository.findByStatus(Job.JobStatus.PENDING, pageable);
        return ResponseEntity.ok(ApiResponse.success("Pending jobs retrieved", jobs));
    }

    /**
     * Approve job
     */
    @PutMapping("/jobs/{id}/approve")
    @Operation(summary = "Approve job", description = "Approve a pending job posting")
    public ResponseEntity<ApiResponse<Job>> approveJob(@PathVariable Long id) {
        log.info("✅ Admin: Approving job {}", id);

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setStatus(Job.JobStatus.APPROVED);
        jobRepository.save(job);

        log.info("✅ Admin: Job {} approved", id);

        return ResponseEntity.ok(ApiResponse.success("Job approved successfully", job));
    }

    /**
     * Reject job
     */
    @PutMapping("/jobs/{id}/reject")
    @Operation(summary = "Reject job", description = "Reject a pending job posting")
    public ResponseEntity<ApiResponse<Job>> rejectJob(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        log.info("❌ Admin: Rejecting job {} - Reason: {}", id, reason);

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setStatus(Job.JobStatus.REJECTED);
        // TODO: Send notification to employer with rejection reason
        jobRepository.save(job);

        log.info("❌ Admin: Job {} rejected", id);

        return ResponseEntity.ok(ApiResponse.success("Job rejected successfully", job));
    }

    /**
     * Delete job
     */
    @DeleteMapping("/jobs/{id}")
    @Operation(summary = "Delete job", description = "Permanently delete a job posting")
    public ResponseEntity<ApiResponse<String>> deleteJob(@PathVariable Long id) {
        log.info("🗑️ Admin: Deleting job {}", id);

        if (!jobRepository.existsById(id)) {
            throw new RuntimeException("Job not found");
        }

        jobRepository.deleteById(id);
        log.info("✅ Admin: Job {} deleted", id);

        return ResponseEntity.ok(ApiResponse.success("Job deleted successfully", null));
    }

    /**
     * Update user role
     */
    @PutMapping("/users/{id}/role")
    @Operation(summary = "Update user role", description = "Change user role (CANDIDATE, EMPLOYER, ADMIN)")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Long id,
            @RequestParam User.Role role
    ) {
        log.info("🔧 Admin: Updating user {} role to {}", id, role);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);
        userRepository.save(user);

        log.info("✅ Admin: User {} role updated to {}", id, role);

        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", user));
    }
}
