package com.pricebrain.notification.repository;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Notification preferences entity and repository.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notification_preferences")
class NotificationPreferences {

    @Id
    private UUID id;

    @Indexed(unique = true)
    private UUID userId;

    // Channel settings
    @Builder.Default
    private Boolean emailEnabled = true;

    @Builder.Default
    private Boolean pushEnabled = true;

    @Builder.Default
    private Boolean smsEnabled = false;

    // Notification types
    @Builder.Default
    private Boolean orderUpdates = true;

    @Builder.Default
    private Boolean promotional = true;

    @Builder.Default
    private Boolean priceAlerts = true;

    @Builder.Default
    private Boolean wishlistUpdates = true;

    @Builder.Default
    private Boolean recommendationUpdates = true;

    // Quiet hours
    @Builder.Default
    private Boolean quietHoursEnabled = false;

    private String quietHoursStart; // HH:mm format

    private String quietHoursEnd; // HH:mm format
}

@Repository
interface NotificationPreferencesRepository extends MongoRepository<NotificationPreferences, UUID> {
    Optional<NotificationPreferences> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
