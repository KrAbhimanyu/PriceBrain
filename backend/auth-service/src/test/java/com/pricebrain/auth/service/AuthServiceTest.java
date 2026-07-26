package com.pricebrain.auth.service;

import com.pricebrain.auth.dto.AuthDTOs.*;
import com.pricebrain.auth.service.AuthService.AuthException;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.User;
import com.pricebrain.shared.model.UserRole;
import com.pricebrain.shared.repository.UserRepository;
import com.pricebrain.shared.service.RedisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RedisService redisService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .passwordHash("$2a$12$hashedpassword")
                .role(UserRole.BUYER)
                .isEmailVerified(false)
                .isLocked(false)
                .failedLoginAttempts(0)
                .isActive(true)
                .build();

        // Setup register request
        registerRequest = RegisterRequest.builder()
                .email("newuser@example.com")
                .password("SecurePass123!")
                .firstName("John")
                .lastName("Doe")
                .role("BUYER")
                .build();

        // Setup login request
        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("SecurePass123!")
                .build();
    }

    @Test
    @DisplayName("Register should create new user successfully")
    void register_Success() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$encodedpassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });

        // Act
        TokenResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("BUYER", response.getRole());
        assertTrue(response.getExpiresIn() > 0);

        verify(userRepository).existsByEmail("newuser@example.com");
        verify(passwordEncoder).encode("SecurePass123!");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register should throw exception when email exists")
    void register_EmailExists() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        AuthException exception = assertThrows(AuthException.class,
                () -> authService.register(registerRequest));

        assertEquals(ErrorCodes.AUTH_013, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Login should authenticate user successfully")
    void login_Success() {
        // Arrange
        when(redisService.isAllowed(anyString(), anyString(), anyInt(), anyLong())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        TokenResponse response = authService.login(loginRequest, "192.168.1.1");

        // Assert
        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("BUYER", response.getRole());

        verify(userRepository).resetFailedLoginAttempts();
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Login should throw exception for invalid credentials")
    void login_InvalidCredentials() {
        // Arrange
        when(redisService.isAllowed(anyString(), anyString(), anyInt(), anyLong())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act & Assert
        AuthException exception = assertThrows(AuthException.class,
                () -> authService.login(loginRequest, "192.168.1.1"));

        assertEquals(ErrorCodes.AUTH_001, exception.getErrorCode());
        verify(userRepository).incrementFailedLoginAttempts();
    }

    @Test
    @DisplayName("Login should throw exception for non-existent user")
    void login_UserNotFound() {
        // Arrange
        when(redisService.isAllowed(anyString(), anyString(), anyInt(), anyLong())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        AuthException exception = assertThrows(AuthException.class,
                () -> authService.login(loginRequest, "192.168.1.1"));

        assertEquals(ErrorCodes.AUTH_001, exception.getErrorCode());
    }

    @Test
    @DisplayName("Login should throw exception for locked account")
    void login_LockedAccount() {
        // Arrange
        testUser.setIsLocked(true);
        testUser.setLockedUntil(java.time.Instant.now().plusSeconds(1800)); // 30 min from now

        when(redisService.isAllowed(anyString(), anyString(), anyInt(), anyLong())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        // Act & Assert
        AuthException exception = assertThrows(AuthException.class,
                () -> authService.login(loginRequest, "192.168.1.1"));

        assertEquals(ErrorCodes.AUTH_002, exception.getErrorCode());
    }

    @Test
    @DisplayName("Login should unlock account when lockout expired")
    void login_UnlockExpiredLockout() {
        // Arrange
        testUser.setIsLocked(true);
        testUser.setLockedUntil(java.time.Instant.now().minusSeconds(60)); // 1 min ago (expired)
        testUser.setFailedLoginAttempts(5);

        when(redisService.isAllowed(anyString(), anyString(), anyInt(), anyLong())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        TokenResponse response = authService.login(loginRequest, "192.168.1.1");

        // Assert
        assertNotNull(response);
        assertFalse(testUser.getIsLocked());
        assertEquals(0, testUser.getFailedLoginAttempts());
    }

    @Test
    @DisplayName("Login should throw rate limit exception")
    void login_RateLimitExceeded() {
        // Arrange
        when(redisService.isAllowed(anyString(), anyString(), anyInt(), anyLong())).thenReturn(false);

        // Act & Assert
        AuthException exception = assertThrows(AuthException.class,
                () -> authService.login(loginRequest, "192.168.1.1"));

        assertEquals(ErrorCodes.RATE_001, exception.getErrorCode());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("Change password should update password successfully")
    void changePassword_Success() {
        // Arrange
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$newencodedpassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        authService.changePassword(testUser.getId(), "SecurePass123!", "NewSecurePass456!");

        // Assert
        verify(passwordEncoder).matches("SecurePass123!", "$2a$12$hashedpassword");
        verify(passwordEncoder).encode("NewSecurePass456!");
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Change password should throw exception for wrong current password")
    void changePassword_WrongCurrentPassword() {
        // Arrange
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        AuthException exception = assertThrows(AuthException.class,
                () -> authService.changePassword(testUser.getId(), "WrongPassword!", "NewPassword!"));

        assertEquals(ErrorCodes.AUTH_014, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Logout should invalidate session")
    void logout_Success() {
        // Act
        authService.logout(testUser.getId(), "refresh-token");

        // Assert
        verify(redisService).deleteSession(testUser.getId().toString());
    }
}
