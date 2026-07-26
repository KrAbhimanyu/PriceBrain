package com.pricebrain.shared.repository;

import com.pricebrain.shared.model.User;
import com.pricebrain.shared.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by email and role.
     */
    Optional<User> findByEmailAndRole(String email, UserRole role);

    /**
     * Check if email exists.
     */
    boolean existsByEmail(String email);

    /**
     * Find all users by role.
     */
    List<User> findByRole(UserRole role);

    /**
     * Find all users by role with pagination.
     */
    Page<User> findByRole(UserRole role, Pageable pageable);

    /**
     * Find locked users.
     */
    List<User> findByIsLockedTrue();

    /**
     * Find users with failed login attempts.
     */
    List<User> findByFailedLoginAttemptsGreaterThanEqual(int attempts);

    /**
     * Find users who haven't verified email.
     */
    List<User> findByIsEmailVerifiedFalse();

    /**
     * Find active users.
     */
    Page<User> findByIsActiveTrue(Pageable pageable);

    /**
     * Find users created after a specific date.
     */
    List<User> findByCreatedAtAfter(Instant date);

    /**
     * Count users by role.
     */
    long countByRole(UserRole role);

    /**
     * Search users by email or name.
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    /**
     * Find recently registered users.
     */
    @Query("SELECT u FROM User u WHERE u.createdAt >= :since ORDER BY u.createdAt DESC")
    List<User> findRecentlyRegistered(@Param("since") Instant since);
}
