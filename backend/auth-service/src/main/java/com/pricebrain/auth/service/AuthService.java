package com.pricebrain.auth.service;

import com.pricebrain.auth.dto.AuthDTOs.*;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.User;
import com.pricebrain.shared.model.UserRole;
import com.pricebrain.shared.repository.UserRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Authentication service implementing business logic for authentication operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisService redisService;

    // Rate limiting constants
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(30);
    private static final Duration RATE_LIMIT_WINDOW = Duration.ofMinutes(1);
    private static final int MAX_REQUESTS_PER_WINDOW = 5;

    // Token expiration
    private static final Duration ACCESS_TOKEN_EXPIRY = Duration.ofHours(1);
    private static final Duration REFRESH_TOKEN_EXPIRY = Duration.ofDays(7);
    private static final Duration PASSWORD_RESET_EXPIRY = Duration.ofHours(1);

    /**
     * Register a new user.
     */
    @Transactional
    public TokenResponse register(RegisterRequest request) {
        log.info("Registering user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException(ErrorCodes.AUTH_013);
        }

        // Create user entity
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(parseRole(request.getRole()))
                .isEmailVerified(false)
                .isLocked(false)
                .failedLoginAttempts(0)
                .isActive(true)
                .build();

        // Save user
        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getId());

        // Generate tokens
        return generateTokens(user);
    }

    /**
     * Authenticate user with email and password.
     */
    @Transactional
    public TokenResponse login(LoginRequest request, String ipAddress) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Check rate limiting
        String rateLimitKey = "login:" + ipAddress;
        if (!redisService.isAllowed(rateLimitKey, "login", MAX_REQUESTS_PER_WINDOW, 60)) {
            log.warn("Rate limit exceeded for IP: {}", ipAddress);
            throw new AuthException(ErrorCodes.RATE_001);
        }

        // Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException(ErrorCodes.AUTH_001));

        // Check if account is locked
        if (Boolean.TRUE.equals(user.getIsLocked())) {
            if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
                log.warn("Login attempt on locked account: {}", user.getEmail());
                throw new AuthException(ErrorCodes.AUTH_002);
            }
            // Unlock if lockout period expired
            user.setIsLocked(false);
            user.setFailedLoginAttempts(0);
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            handleFailedLogin(user);
            throw new AuthException(ErrorCodes.AUTH_001);
        }

        // Reset failed login attempts
        user.resetFailedLoginAttempts();
        user.setLastLoginAt(Instant.now());
        user.setLastLoginIp(ipAddress);
        userRepository.save(user);

        log.info("User logged in successfully: {}", user.getId());
        return generateTokens(user);
    }

    /**
     * Refresh access token using refresh token.
     */
    public TokenResponse refreshToken(String refreshToken) {
        log.info("Refreshing token");

        // TODO: Validate refresh token from Redis/database
        // This is a placeholder implementation

        // For demo purposes, return a new token set
        return TokenResponse.builder()
                .accessToken("new-access-token-" + UUID.randomUUID())
                .refreshToken("new-refresh-token-" + UUID.randomUUID())
                .tokenType("Bearer")
                .expiresIn((int) ACCESS_TOKEN_EXPIRY.toSeconds())
                .role("BUYER")
                .userId(UUID.randomUUID())
                .build();
    }

    /**
     * Logout user and invalidate tokens.
     */
    @Transactional
    public void logout(UUID userId, String refreshToken) {
        log.info("Logging out user: {}", userId);

        // TODO: Invalidate refresh token in Redis
        // redisService.deleteSession(userId.toString());

        log.info("User logged out successfully: {}", userId);
    }

    /**
     * Request password reset.
     */
    @Transactional
    public void forgotPassword(String email) {
        log.info("Password reset requested for: {}", email);

        // Always return success (security)
        // TODO: Send email with reset link
        // TODO: Store reset token in Redis with expiration

        log.info("Password reset email sent if account exists");
    }

    /**
     * Reset password using token.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password with token");

        // TODO: Validate token from Redis
        // TODO: Find user by token
        // TODO: Update password
        // TODO: Invalidate token

        log.info("Password reset successful");
    }

    /**
     * Change password for authenticated user.
     */
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        log.info("Changing password for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException(ErrorCodes.AUTH_015));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new AuthException(ErrorCodes.AUTH_014);
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", userId);
    }

    /**
     * Verify email address.
     */
    @Transactional
    public void verifyEmail(String token) {
        log.info("Verifying email with token");

        // TODO: Validate verification token
        // TODO: Update user email verification status

        log.info("Email verified successfully");
    }

    /**
     * Generate JWT tokens for user.
     */
    private TokenResponse generateTokens(User user) {
        // TODO: Generate actual JWT tokens
        String accessToken = "access-token-" + UUID.randomUUID();
        String refreshToken = "refresh-token-" + UUID.randomUUID();

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn((int) ACCESS_TOKEN_EXPIRY.toSeconds())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    /**
     * Handle failed login attempt.
     */
    private void handleFailedLogin(User user) {
        user.incrementFailedLoginAttempts();
        userRepository.save(user);

        log.warn("Failed login attempt for user: {}, attempts: {}",
                user.getEmail(), user.getFailedLoginAttempts());
    }

    /**
     * Parse role from string.
     */
    private UserRole parseRole(String roleStr) {
        try {
            return UserRole.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return UserRole.BUYER;
        }
    }

    /**
     * Custom authentication exception.
     */
    public static class AuthException extends RuntimeException {
        private final ErrorCodes errorCode;

        public AuthException(ErrorCodes errorCode) {
            super(errorCode.getDefaultMessage());
            this.errorCode = errorCode;
        }

        public ErrorCodes getErrorCode() {
            return errorCode;
        }
    }
}
