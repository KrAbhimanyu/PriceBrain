package com.pricebrain.shared.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * MongoDB document for notifications.
 */
@Document(collection = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "user_status_created", def = "{'userId': 1, 'status': 1, 'createdAt': -1}")
public class NotificationDocument {

    @Id
    private String id;

    @Indexed
    private UUID userId;

    private NotificationType type;

    private String title;

    private String message;

    private NotificationData data;

    private List<NotificationChannel> channels;

    @Indexed
    private NotificationStatus status;

    private Instant readAt;

    private NotificationPriority priority;

    private Instant scheduledAt;

    private Instant sentAt;

    private Instant createdAt;

    private Instant updatedAt;

    public enum NotificationType {
        ORDER_UPDATE,
        PRICE_DROP,
        WISHLIST_ALERT,
        PROMOTION,
        SYSTEM,
        AI_RECOMMENDATION,
        REVIEW,
        SHIPPING
    }

    public enum NotificationChannel {
        IN_APP,
        EMAIL,
        SMS,
        PUSH
    }

    public enum NotificationStatus {
        PENDING,
        SENT,
        READ,
        ARCHIVED,
        FAILED
    }

    public enum NotificationPriority {
        LOW,
        MEDIUM,
        HIGH
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationData {
        private UUID orderId;
        private UUID productId;
        private UUID sellerId;
        private String url;
        private String imageUrl;
        private Map<String, Object> metadata;
    }
}
