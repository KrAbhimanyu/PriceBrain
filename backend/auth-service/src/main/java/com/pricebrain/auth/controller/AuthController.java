package com.pricebrain.auth.controller;

import com.pricebrain.auth.dto.AuthDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import com.pricebrain.shared.api.ErrorCodes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwgResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Authentication API endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication & Authorization APIs")
@SecurityRequirements()
public class AuthController extends BaseController {

    // ==================== REGISTER ====================

    @Operation(
            summary = "Register new user",
            description = """
                    Register a new user account. Supports both buyer and seller registration.
                    
                    **Password Requirements:**
                    - Minimum 8 characters
                    - At least one uppercase letter
                    - At least one lowercase letter
                    - At least one number
                    - At least one special character (@$!%*?&)
                    
                    **Roles:**
                    - `BUYER` - Regular customer account
                    - `SELLER` - Seller/store account
                    """
    )
    @ApiResponses({
            @SwgResponse(
                    responseCode = "201",
                    description = "User registered successfully",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))
            ),
            @SwgResponse(
                    responseCode = "400",
                    description = "Validation failed",
                    content = @Content(schema = @Schema(implementation = ApiResponse.ErrorDetails.class))
            ),
            @SwgResponse(
                    responseCode = "409",
                    description = "Email already exists",
                    content = @Content(schema = @Schema(implementation = ApiResponse.ErrorDetails.class))
            )
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TokenResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            @Parameter(description = "Correlation ID for request tracing")
            @RequestHeader(value = "X-Correlation-ID", required = false) String correlationId) {

        log.info("Register request for email: {} with role: {}", request.getEmail(), request.getRole());

        // TODO: Implement registration logic
        TokenResponse response = TokenResponse.builder()
                .accessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .refreshToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .tokenType("Bearer")
                .expiresIn(3600)
                .role(request.getRole())
                .userId(UUID.randomUUID())
                .build();

        return created(response, "Registration successful. Please verify your email.");
    }

    // ==================== LOGIN ====================

    @Operation(
            summary = "User login",
            description = """
                    Authenticate user and receive JWT tokens.
                    
                    **Returns:**
                    - Access token (1 hour expiry)
                    - Refresh token (7 days expiry)
                    - User role and ID
                    
                    **Rate Limiting:**
                    - 5 attempts per minute per IP
                    - Account locked for 30 minutes after 5 failed attempts
                    """
    )
    @ApiResponses({
            @SwgResponse(
                    responseCode = "200",
                    description = "Login successful",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))
            ),
            @SwgResponse(
                    responseCode = "401",
                    description = "Invalid credentials",
                    content = @Content(schema = @Schema(implementation = ApiResponse.ErrorDetails.class))
            ),
            @SwgResponse(
                    responseCode = "423",
                    description = "Account locked",
                    content = @Content(schema = @Schema(implementation = ApiResponse.ErrorDetails.class))
            )
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request,
            @Parameter(description = "Device identifier for session tracking")
            @RequestHeader(value = "X-Device-ID", required = false) String deviceId,
            @Parameter(description = "Correlation ID for request tracing")
            @RequestHeader(value = "X-Correlation-ID", required = false) String correlationId) {

        log.info("Login attempt for email: {}", request.getEmail());

        // TODO: Implement login logic
        TokenResponse response = TokenResponse.builder()
                .accessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .refreshToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .tokenType("Bearer")
                .expiresIn(3600)
                .role("BUYER")
                .userId(UUID.randomUUID())
                .build();

        return success(response, "Login successful");
    }

    // ==================== REFRESH TOKEN ====================

    @Operation(
            summary = "Refresh access token",
            description = """
                    Exchange a valid refresh token for a new access token.
                    
                    **Token Handling:**
                    - Refresh token is httpOnly cookie (recommended)
                    - Can also be sent in request body
                    - Refresh tokens are single-use
                    - New refresh token issued with new access token
                    """
    )
    @ApiResponses({
            @SwgResponse(
                    responseCode = "200",
                    description = "Token refreshed successfully",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))
            ),
            @SwgResponse(
                    responseCode = "401",
                    description = "Invalid or expired refresh token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.ErrorDetails.class))
            )
    })
    @PostMapping("/refresh")
    @SecurityRequirements()
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {

        log.info("Token refresh request received");

        // TODO: Implement token refresh logic
        TokenResponse response = TokenResponse.builder()
                .accessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .refreshToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .tokenType("Bearer")
                .expiresIn(3600)
                .role("BUYER")
                .userId(UUID.randomUUID())
                .build();

        return success(response);
    }

    // ==================== LOGOUT ====================

    @Operation(
            summary = "User logout",
            description = """
                    Invalidate the current session and refresh token.
                    
                    **Behavior:**
                    - Access token is blacklisted
                    - Refresh token is revoked
                    - Device session is destroyed
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Logout successful"),
            @SwgResponse(responseCode = "401", description = "Invalid token")
    })
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) LogoutRequest request,
            @Parameter(description = "User ID")
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Logout request for user: {}", userId);

        // TODO: Implement logout logic
        return success("Logged out successfully");
    }

    // ==================== VERIFY EMAIL ====================

    @Operation(
            summary = "Verify email address",
            description = """
                    Verify user's email address using the verification token sent to their email.
                    
                    **Token:**
                    - Token is valid for 24 hours
                    - Single use only
                    - Cannot be reused after verification
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Email verified successfully"),
            @SwgResponse(responseCode = "400", description = "Invalid or expired token"),
            @SwgResponse(responseCode = "409", description = "Email already verified")
    })
    @PostMapping("/verify-email")
    @SecurityRequirements()
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {

        log.info("Email verification request received");

        // TODO: Implement email verification
        return success("Email verified successfully");
    }

    // ==================== FORGOT PASSWORD ====================

    @Operation(
            summary = "Request password reset",
            description = """
                    Request a password reset link to be sent to the user's email.
                    
                    **Behavior:**
                    - Sends email with reset link
                    - Token valid for 1 hour
                    - Rate limited to 3 requests per hour
                    - Returns success even if email doesn't exist (security)
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Reset link sent if email exists"),
            @SwgResponse(responseCode = "400", description = "Invalid email format"),
            @SwgResponse(responseCode = "429", description = "Too many requests")
    })
    @PostMapping("/forgot-password")
    @SecurityRequirements()
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        log.info("Forgot password request for: {}", request.getEmail());

        // TODO: Implement forgot password logic
        return success("If an account exists with this email, a password reset link has been sent");
    }

    // ==================== RESET PASSWORD ====================

    @Operation(
            summary = "Reset password",
            description = """
                    Reset password using the token from forgot-password email.
                    
                    **Token:**
                    - Valid for 1 hour from request
                    - Single use only
                    - Automatically invalidates all existing sessions
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Password reset successfully"),
            @SwgResponse(responseCode = "400", description = "Invalid or expired token"),
            @SwgResponse(responseCode = "400", description = "Password does not meet requirements")
    })
    @PostMapping("/reset-password")
    @SecurityRequirements()
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        log.info("Password reset request received");

        // TODO: Implement password reset
        return success("Password reset successfully. Please login with your new password.");
    }

    // ==================== CHANGE PASSWORD ====================

    @Operation(
            summary = "Change password (authenticated)",
            description = """
                    Change password for authenticated user.
                    
                    **Requirements:**
                    - Must provide current password
                    - New password must meet complexity requirements
                    - All other sessions are invalidated
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Password changed successfully"),
            @SwgResponse(responseCode = "400", description = "Current password is incorrect"),
            @SwgResponse(responseCode = "401", description = "Not authenticated")
    })
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @Parameter(description = "User ID")
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Change password request for user: {}", userId);

        // TODO: Implement password change
        return success("Password changed successfully");
    }

    // ==================== MFA ====================

    @Operation(
            summary = "Enable MFA",
            description = """
                    Enable multi-factor authentication for enhanced account security.
                    
                    **Returns:**
                    - QR code for authenticator app setup
                    - Secret key for manual entry
                    - Backup codes
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "MFA setup initiated"),
            @SwgResponse(responseCode = "401", description = "Not authenticated")
    })
    @PostMapping("/mfa/enable")
    public ResponseEntity<ApiResponse<MFASetupResponse>> enableMFA(
            @Parameter(description = "User ID")
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("MFA enable request for user: {}", userId);

        // TODO: Implement MFA enable
        MFASetupResponse response = MFASetupResponse.builder()
                .qrCodeUrl("data:image/png;base64,...")
                .secretKey("JBSWY3DPEHPK3PXP")
                .backupCodes(java.util.List.of("ABCD-1234", "EFGH-5678"))
                .build();

        return success(response, "MFA enabled. Please verify with your authenticator app.");
    }

    @Operation(
            summary = "Verify MFA",
            description = "Verify MFA code to complete setup or during login"
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "MFA verified successfully"),
            @SwgResponse(responseCode = "400", description = "Invalid MFA code")
    })
    @PostMapping("/mfa/verify")
    @SecurityRequirements()
    public ResponseEntity<ApiResponse<TokenResponse>> verifyMFA(
            @Valid @RequestBody MFAVerifyRequest request) {

        log.info("MFA verify request");

        // TODO: Implement MFA verification
        TokenResponse response = TokenResponse.builder()
                .accessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .refreshToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                .tokenType("Bearer")
                .expiresIn(3600)
                .role("BUYER")
                .userId(UUID.randomUUID())
                .build();

        return success(response);
    }

    @Operation(
            summary = "Disable MFA",
            description = "Disable multi-factor authentication (requires current MFA code)"
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "MFA disabled successfully"),
            @SwgResponse(responseCode = "400", description = "Invalid MFA code")
    })
    @PostMapping("/mfa/disable")
    public ResponseEntity<ApiResponse<Void>> disableMFA(
            @Valid @RequestBody MFAVerifyRequest request,
            @Parameter(description = "User ID")
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("MFA disable request for user: {}", userId);

        // TODO: Implement MFA disable
        return success("MFA disabled successfully");
    }

    // ==================== SCHEMAS ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "MFA setup response")
    public static class MFASetupResponse {
        @Schema(description = "QR code URL for authenticator app", example = "data:image/png;base64,...")
        private String qrCodeUrl;

        @Schema(description = "Secret key for manual entry", example = "JBSWY3DPEHPK3PXP")
        private String secretKey;

        @Schema(description = "Backup codes for account recovery")
        private java.util.List<String> backupCodes;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "MFA verification request")
    public static class MFAVerifyRequest {
        @Schema(description = "MFA code from authenticator app", example = "123456")
        private String code;
    }
}
