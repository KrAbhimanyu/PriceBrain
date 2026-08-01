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
 * MongoDB document for AI missions (ongoing AI tasks).
 */
@Document(collection = "ai_missions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "user_status", def = "{'userId': 1, 'status': 1}")
@CompoundIndex(name = "status_nextRun", def = "{'status': 1, 'nextRunAt': 1}")
public class AIMissionDocument {

    @Id
    private String id;

    @Indexed
    private UUID userId;

    private MissionType type;

    private String name;

    private String description;

    @Indexed
    private MissionStatus status;

    private MissionConfig config;

    private List<MissionResult> results;

    private Instant lastRunAt;

    @Indexed
    private Instant nextRunAt;

    private Instant completedAt;

    private Instant createdAt;

    private Instant updatedAt;

    public enum MissionType {
        PRICE_MONITOR,
        WISHLIST_TRACK,
        STOCK_ALERT,
        NEW_PRODUCT_ALERT,
        TREND_ALERT,
        COMPETITOR_MONITOR,
        REVIEW_MONITOR
    }

    public enum MissionStatus {
        ACTIVE,
        PAUSED,
        COMPLETED,
        FAILED,
        CANCELLED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MissionConfig {
        private UUID targetProductId;
        private UUID targetCategoryId;
        private UUID targetBrandId;
        private Double targetPrice;
        private Double priceDropPercent;
        private boolean notifyOnDrop;
        private boolean notifyOnIncrease;
        private Integer checkIntervalHours;
        private String notificationChannel;
        private Map<String, Object> additionalConfig;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MissionResult {
        private Instant runAt;
        private boolean success;
        private Double currentPrice;
        private Double previousPrice;
        private boolean conditionMet;
        private String message;
        private boolean notificationSent;
        private Map<String, Object> metadata;
    }
}
