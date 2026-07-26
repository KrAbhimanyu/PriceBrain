package com.pricebrain.user.service;

import com.pricebrain.user.controller.UserController.*;
import com.pricebrain.user.dto.UserDTOs.*;
import com.pricebrain.user.mapper.UserMapper;
import com.pricebrain.user.repository.AddressRepository;
import com.pricebrain.user.repository.UserPreferenceRepository;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.Address;
import com.pricebrain.shared.model.User;
import com.pricebrain.shared.model.UserPreference;
import com.pricebrain.shared.repository.UserRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * User service implementing business logic for user operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RedisService redisService;

    // ==================== PROFILE ====================

    /**
     * Get user profile by ID.
     */
    @Transactional(readOnly = true)
    public UserProfileDTO getProfile(UUID userId) {
        log.info("Getting profile for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_001));

        PreferencesDTO preferences = getPreferences(userId);

        return UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole().name())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .preferences(preferences)
                .build();
    }

    /**
     * Update user profile.
     */
    @Transactional
    public UserProfileDTO updateProfile(UUID userId, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_001));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            // Verify phone format
            user.setPhone(request.getPhone());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        user = userRepository.save(user);

        // Clear cache
        redisService.delete("user:profile:" + userId);

        log.info("Profile updated for user: {}", userId);
        return getProfile(userId);
    }

    /**
     * Upload profile image.
     */
    @Transactional
    public UserProfileDTO uploadProfileImage(UUID userId, String imageUrl) {
        log.info("Uploading profile image for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_001));

        user.setProfileImageUrl(imageUrl);
        user = userRepository.save(user);

        // Clear cache
        redisService.delete("user:profile:" + userId);

        log.info("Profile image uploaded for user: {}", userId);
        return getProfile(userId);
    }

    /**
     * Delete profile image.
     */
    @Transactional
    public void deleteProfileImage(UUID userId) {
        log.info("Deleting profile image for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_001));

        user.setProfileImageUrl(null);
        userRepository.save(user);

        // Clear cache
        redisService.delete("user:profile:" + userId);

        log.info("Profile image deleted for user: {}", userId);
    }

    // ==================== ADDRESSES ====================

    /**
     * Get all addresses for user.
     */
    @Transactional(readOnly = true)
    public AddressesDTO getAddresses(UUID userId) {
        log.info("Getting addresses for user: {}", userId);

        List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);

        List<AddressDTO> addressDTOs = addresses.stream()
                .map(this::toAddressDTO)
                .toList();

        Address defaultShipping = addressRepository.findDefaultShippingByUserId(userId).orElse(null);
        Address defaultBilling = addressRepository.findDefaultBillingByUserId(userId).orElse(null);

        return AddressesDTO.builder()
                .addresses(addressDTOs)
                .defaultShippingId(defaultShipping != null ? defaultShipping.getId() : null)
                .defaultBillingId(defaultBilling != null ? defaultBilling.getId() : null)
                .build();
    }

    /**
     * Add new address.
     */
    @Transactional
    public AddressDTO addAddress(UUID userId, AddressRequest request) {
        log.info("Adding address for user: {}", userId);

        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new UserException(ErrorCodes.USER_001);
        }

        Address address = Address.builder()
                .userId(userId)
                .type(request.getType())
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .landmark(request.getLandmark())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry() != null ? request.getCountry() : "IN")
                .label(request.getLabel())
                .isDefault(false)
                .build();

        // If this is the first address, make it default
        List<Address> existingAddresses = addressRepository.findByUserId(userId);
        if (existingAddresses.isEmpty()) {
            address.setIsDefault(true);
        }

        address = addressRepository.save(address);
        log.info("Address added for user: {}, addressId: {}", userId, address.getId());

        return toAddressDTO(address);
    }

    /**
     * Update address.
     */
    @Transactional
    public AddressDTO updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        log.info("Updating address: {} for user: {}", addressId, userId);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_004));

        // Verify ownership
        if (!address.getUserId().equals(userId)) {
            throw new UserException(ErrorCodes.AUTHZ_004);
        }

        address.setType(request.getType());
        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setLandmark(request.getLandmark());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) {
            address.setCountry(request.getCountry());
        }
        address.setLabel(request.getLabel());

        address = addressRepository.save(address);
        log.info("Address updated: {}", addressId);

        return toAddressDTO(address);
    }

    /**
     * Delete address.
     */
    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        log.info("Deleting address: {} for user: {}", addressId, userId);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_004));

        // Verify ownership
        if (!address.getUserId().equals(userId)) {
            throw new UserException(ErrorCodes.AUTHZ_004);
        }

        addressRepository.delete(address);
        log.info("Address deleted: {}", addressId);
    }

    /**
     * Set default address.
     */
    @Transactional
    public void setDefaultAddress(UUID userId, UUID addressId, String type) {
        log.info("Setting default address: {} for user: {}, type: {}", addressId, userId, type);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_004));

        // Verify ownership
        if (!address.getUserId().equals(userId)) {
            throw new UserException(ErrorCodes.AUTHZ_004);
        }

        // Clear existing default for this type
        if ("shipping".equalsIgnoreCase(type) || "both".equalsIgnoreCase(type)) {
            addressRepository.clearDefaultShipping(userId);
        }
        if ("billing".equalsIgnoreCase(type) || "both".equalsIgnoreCase(type)) {
            addressRepository.clearDefaultBilling(userId);
        }

        // Set new default
        address.setIsDefault(true);
        addressRepository.save(address);

        log.info("Default address set: {}", addressId);
    }

    // ==================== PREFERENCES ====================

    /**
     * Get user preferences.
     */
    @Transactional(readOnly = true)
    public PreferencesDTO getPreferences(UUID userId) {
        log.info("Getting preferences for user: {}", userId);

        UserPreference prefs = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        return toPreferencesDTO(prefs);
    }

    /**
     * Update user preferences.
     */
    @Transactional
    public PreferencesDTO updatePreferences(UUID userId, UpdatePreferencesRequest request) {
        log.info("Updating preferences for user: {}", userId);

        UserPreference prefs = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        if (request.getLanguage() != null) {
            prefs.setLanguage(request.getLanguage());
        }
        if (request.getCurrency() != null) {
            prefs.setCurrency(request.getCurrency());
        }
        if (request.getTimezone() != null) {
            prefs.setTimezone(request.getTimezone());
        }

        if (request.getNotifications() != null) {
            NotificationPreferencesDTO notif = request.getNotifications();
            prefs.setEmailOrderUpdates(notif.getEmailOrderUpdates());
            prefs.setEmailPromotions(notif.getEmailPromotions());
            prefs.setPushOrderUpdates(notif.getPushOrderUpdates());
            prefs.setPushRecommendations(notif.getPushRecommendations());
            prefs.setSmsOrderUpdates(notif.getSmsOrderUpdates());
        }

        if (request.getPrivacy() != null) {
            PrivacyPreferencesDTO priv = request.getPrivacy();
            prefs.setShowProfilePublic(priv.getShowProfilePublic());
            prefs.setShowOrdersPublic(priv.getShowOrdersPublic());
            prefs.setAllowDataAnalytics(priv.getAllowDataAnalytics());
        }

        prefs = preferenceRepository.save(prefs);

        // Clear user cache
        redisService.delete("user:profile:" + userId);
        redisService.delete("user:preferences:" + userId);

        log.info("Preferences updated for user: {}", userId);
        return toPreferencesDTO(prefs);
    }

    // ==================== ACCOUNT ====================

    /**
     * Deactivate account.
     */
    @Transactional
    public void deactivateAccount(UUID userId, String reason) {
        log.info("Deactivating account for user: {}, reason: {}", userId, reason);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_001));

        user.setIsActive(false);
        user.setDeactivationReason(reason);
        userRepository.save(user);

        // Clear all user caches
        redisService.delete("user:profile:" + userId);
        redisService.delete("user:preferences:" + userId);
        redisService.delete("user:session:" + userId);

        log.info("Account deactivated for user: {}", userId);
    }

    /**
     * Delete account (GDPR).
     */
    @Transactional
    public void deleteAccount(UUID userId, String password) {
        log.info("Delete account request for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_001));

        // Verify password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UserException(ErrorCodes.AUTH_014);
        }

        // Schedule for deletion (GDPR compliance - 30 day grace period)
        user.setScheduledDeletion(java.time.Instant.now().plusSeconds(30 * 24 * 60 * 60));
        userRepository.save(user);

        // Clear all user caches
        redisService.delete("user:profile:" + userId);
        redisService.delete("user:preferences:" + userId);
        redisService.delete("user:session:" + userId);

        log.info("Account scheduled for deletion for user: {}", userId);
    }

    /**
     * Export user data (GDPR).
     */
    @Transactional(readOnly = true)
    public DataExportDTO exportUserData(UUID userId) {
        log.info("Exporting data for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(ErrorCodes.USER_001));

        List<Address> addresses = addressRepository.findByUserId(userId);
        AddressesDTO addressesDTO = getAddresses(userId);

        return DataExportDTO.builder()
                .userId(userId)
                .email(user.getEmail())
                .profile(getProfile(userId))
                .addresses(addressesDTO)
                .ordersCount(0) // TODO: Get from order service
                .wishlistsCount(0) // TODO: Get from wishlist service
                .exportedAt(java.time.Instant.now())
                .build();
    }

    // ==================== HELPERS ====================

    /**
     * Create default preferences for new user.
     */
    private UserPreference createDefaultPreferences(UUID userId) {
        UserPreference prefs = UserPreference.builder()
                .userId(userId)
                .language("en")
                .currency("INR")
                .timezone("Asia/Kolkata")
                .emailOrderUpdates(true)
                .emailPromotions(true)
                .pushOrderUpdates(true)
                .pushRecommendations(true)
                .smsOrderUpdates(false)
                .showProfilePublic(false)
                .showOrdersPublic(false)
                .allowDataAnalytics(true)
                .build();

        return preferenceRepository.save(prefs);
    }

    /**
     * Convert Address entity to DTO.
     */
    private AddressDTO toAddressDTO(Address address) {
        return AddressDTO.builder()
                .id(address.getId())
                .type(address.getType())
                .recipientName(address.getRecipientName())
                .phone(address.getPhone())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .landmark(address.getLandmark())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.getIsDefault())
                .label(address.getLabel())
                .build();
    }

    /**
     * Convert UserPreference to PreferencesDTO.
     */
    private PreferencesDTO toPreferencesDTO(UserPreference prefs) {
        return PreferencesDTO.builder()
                .language(prefs.getLanguage())
                .currency(prefs.getCurrency())
                .timezone(prefs.getTimezone())
                .notifications(NotificationPreferencesDTO.builder()
                        .emailOrderUpdates(prefs.getEmailOrderUpdates())
                        .emailPromotions(prefs.getEmailPromotions())
                        .pushOrderUpdates(prefs.getPushOrderUpdates())
                        .pushRecommendations(prefs.getPushRecommendations())
                        .smsOrderUpdates(prefs.getSmsOrderUpdates())
                        .build())
                .privacy(PrivacyPreferencesDTO.builder()
                        .showProfilePublic(prefs.getShowProfilePublic())
                        .showOrdersPublic(prefs.getShowOrdersPublic())
                        .allowDataAnalytics(prefs.getAllowDataAnalytics())
                        .build())
                .build();
    }

    /**
     * Custom user exception.
     */
    public static class UserException extends RuntimeException {
        private final ErrorCodes errorCode;

        public UserException(ErrorCodes errorCode) {
            super(errorCode.getDefaultMessage());
            this.errorCode = errorCode;
        }

        public ErrorCodes getErrorCode() {
            return errorCode;
        }
    }
}
