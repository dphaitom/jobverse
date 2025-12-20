package com.jobverse.repository;

import com.jobverse.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.profile WHERE u.email = :email")
    Optional<User> findByEmailWithProfile(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.profile WHERE u.id = :id")
    Optional<User> findByIdWithProfile(Long id);

    Optional<User> findByOauthProviderAndOauthId(String provider, String oauthId);

    // Admin queries
    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<User> findByRole(User.Role role, Pageable pageable);

    Page<User> findByStatus(User.Status status, Pageable pageable);

    Page<User> findByRoleAndStatus(User.Role role, User.Status status, Pageable pageable);
}
