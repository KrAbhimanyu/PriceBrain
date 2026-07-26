package com.pricebrain.user.controller;

import com.pricebrain.user.dto.UserDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import com.pricebrain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwgResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * User API endpoints for profile, addresses, and preferences management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController extends BaseController {

    private final UserService userService;

    // ==================== PROFILE ====================

    @Operation(
            summary = "Get current user profile",
            description = "Retrieve the authenticated user's profile information"
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Profile retrieved successfully"),
            @SwgResponse(responseCode = "401", description = "Not authenticated"),
            @SwgResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getProfile(
            @Parameter(description = "User ID")
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get profile request for user: {}", userId);
        UserProfileDTO profile = userService.getProfile(userId);
        return success(profile);
    }

    @Operation(summary = "Update user profile")
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateProfile(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody UpdateProfileRequest request) {

        log.info("Update profile request for user: {}", userId);
        UserProfileDTO profile = userService.updateProfile(userId, request);
        return success(profile, "Profile updated successfully");
    }

    @Operation(summary = "Upload profile image")
    @PostMapping("/profile/image")
    public ResponseEntity<ApiResponse<UserProfileDTO>> uploadProfileImage(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestBody UploadImageRequest request) {

        log.info("Upload profile image for user: {}", userId);
        UserProfileDTO profile = userService.uploadProfileImage(userId, request.getImageUrl());
        return success(profile, "Profile image uploaded successfully");
    }

    @Operation(summary = "Delete profile image")
    @DeleteMapping("/profile/image")
    public ResponseEntity<ApiResponse<Void>> deleteProfileImage(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Delete profile image for user: {}", userId);
        userService.deleteProfileImage(userId);
        return success("Profile image deleted successfully");
    }

    // ==================== ADDRESSES ====================

    @Operation(summary = "Get all addresses")
    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressesDTO>> getAddresses(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get addresses for user: {}", userId);
        AddressesDTO addresses = userService.getAddresses(userId);
        return success(addresses);
    }

    @Operation(summary = "Add new address")
    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressDTO>> addAddress(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody AddressRequest request) {

        log.info("Add address for user: {}", userId);
        AddressDTO address = userService.addAddress(userId, request);
        return created(address, "Address added successfully");
    }

    @Operation(summary = "Update address")
    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<AddressDTO>> updateAddress(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID addressId,
            @Valid @RequestBody AddressRequest request) {

        log.info("Update address: {} for user: {}", addressId, userId);
        AddressDTO address = userService.updateAddress(userId, addressId, request);
        return success(address, "Address updated successfully");
    }

    @Operation(summary = "Delete address")
    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID addressId) {

        log.info("Delete address: {} for user: {}", addressId, userId);
        userService.deleteAddress(userId, addressId);
        return success("Address deleted successfully");
    }

    @Operation(summary = "Set default address")
    @PutMapping("/addresses/{addressId}/default")
    public ResponseEntity<ApiResponse<Void>> setDefaultAddress(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID addressId,
            @RequestParam(defaultValue = "shipping") String type) {

        log.info("Set default address: {} for user: {}", addressId, userId);
        userService.setDefaultAddress(userId, addressId, type);
        return success("Default address set successfully");
    }

    // ==================== PREFERENCES ====================

    @Operation(summary = "Get user preferences")
    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<PreferencesDTO>> getPreferences(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get preferences for user: {}", userId);
        PreferencesDTO preferences = userService.getPreferences(userId);
        return success(preferences);
    }

    @Operation(summary = "Update user preferences")
    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<PreferencesDTO>> updatePreferences(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody UpdatePreferencesRequest request) {

        log.info("Update preferences for user: {}", userId);
        PreferencesDTO preferences = userService.updatePreferences(userId, request);
        return success(preferences, "Preferences updated successfully");
    }

    // ==================== ACCOUNT ====================

    @Operation(summary = "Deactivate account")
    @PostMapping("/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody DeactivateAccountRequest request) {

        log.info("Deactivate account for user: {}", userId);
        userService.deactivateAccount(userId, request.getReason());
        return success("Account deactivated successfully");
    }

    @Operation(summary = "Delete account (GDPR)")
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody DeleteAccountRequest request) {

        log.info("Delete account request for user: {}", userId);
        userService.deleteAccount(userId, request.getPassword());
        return success("Account scheduled for deletion");
    }

    @Operation(summary = "Export user data (GDPR)")
    @GetMapping("/data-export")
    public ResponseEntity<ApiResponse<DataExportDTO>> exportData(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Data export request for user: {}", userId);
        DataExportDTO exportData = userService.exportUserData(userId);
        return success(exportData);
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "User profile")
    public static class UserProfileDTO {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String phone;
        private String profileImageUrl;
        private String role;
        private Boolean isEmailVerified;
        private Boolean isPhoneVerified;
        private PreferencesDTO preferences;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update profile request")
    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String dateOfBirth;
        private String gender;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Upload image request")
    public static class UploadImageRequest {
        private String imageUrl;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "All user addresses")
    public static class AddressesDTO {
        private List<AddressDTO> addresses;
        private UUID defaultShippingId;
        private UUID defaultBillingId;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Address")
    public static class AddressDTO {
        private UUID id;
        private String type;
        private String recipientName;
        private String phone;
        private String addressLine1;
        private String addressLine2;
        private String landmark;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private Boolean isDefault;
        private String label;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Address request")
    public static class AddressRequest {
        @Schema(description = "Address type", example = "HOME or WORK")
        private String type;
        
        private String recipientName;
        private String phone;
        private String addressLine1;
        private String addressLine2;
        private String landmark;
        private String city;
        private String state;
        private String postalCode;
        @Schema(description = "ISO country code", example = "IN")
        private String country;
        private String label;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "User preferences")
    public static class PreferencesDTO {
        private String language;
        private String currency;
        private String timezone;
        private NotificationPreferencesDTO notifications;
        private PrivacyPreferencesDTO privacy;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Notification preferences")
    public static class NotificationPreferencesDTO {
        private Boolean emailOrderUpdates;
        private Boolean emailPromotions;
        private Boolean pushOrderUpdates;
        private Boolean pushRecommendations;
        private Boolean smsOrderUpdates;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Privacy preferences")
    public static class PrivacyPreferencesDTO {
        private Boolean showProfilePublic;
        private Boolean showOrdersPublic;
        private Boolean allowDataAnalytics;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update preferences request")
    public static class UpdatePreferencesRequest {
        private String language;
        private String currency;
        private String timezone;
        private NotificationPreferencesDTO notifications;
        private PrivacyPreferencesDTO privacy;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Deactivate account request")
    public static class DeactivateAccountRequest {
        private String reason;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Delete account request")
    public static class DeleteAccountRequest {
        private String password;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Data export response")
    public static class DataExportDTO {
        private UUID userId;
        private String email;
        private UserProfileDTO profile;
        private AddressesDTO addresses;
        private Integer ordersCount;
        private Integer wishlistsCount;
        private java.time.Instant exportedAt;
    }
}
