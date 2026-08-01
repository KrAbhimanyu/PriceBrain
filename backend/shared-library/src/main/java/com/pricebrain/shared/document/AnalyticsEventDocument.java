package com.pricebrain.shared.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * MongoDB document for analytics events.
 */
@Document(collection = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "user_timestamp", def = "{'userId': 1, 'timestamp': -1}")
@CompoundIndex(name = "event_type_timestamp", def = "{'eventType': 1, 'timestamp': -1}")
public class AnalyticsEventDocument {

    @Id
    private String id;

    @Indexed
    private String eventType;

    @Indexed
    private UUID userId;

    private String sessionId;

    @Indexed
    private Instant timestamp;

    private EventProperties properties;

    private AIContext aiContext;

    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventProperties {
        private String page;
        private UUID productId;
        private UUID categoryId;
        private UUID sellerId;
        private UUID orderId;
        private String searchQuery;
        private Double revenue;
        private String device;
        private String browser;
        private String os;
        private String country;
        private String city;
        private String region;
        private String referrer;
        private String ip;
        private Map<String, Object> customProperties;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIContext {
        private boolean recommended;
        private String aiModel;
        private Double confidence;
        private String recommendationType;
        private UUID campaignId;
    }

    // Common event types
    public static final String EVENT_PAGE_VIEW = "page_view";
    public static final String EVENT_PRODUCT_VIEW = "product_view";
    public static final String EVENT_ADD_TO_CART = "add_to_cart";
    public static final String EVENT_REMOVE_FROM_CART = "remove_from_cart";
    public static final String EVENT_ADD_TO_WISHLIST = "add_to_wishlist";
    public static final String EVENT_SEARCH = "search";
    public static final String EVENT_CHECKOUT_START = "checkout_start";
    public static final String EVENT_PURCHASE = "purchase";
    public static final String EVENT_LOGIN = "login";
    public static final String EVENT_REGISTER = "register";
    public static final String EVENT_LOGOUT = "logout";
    public static final String EVENT_AI_ASK = "ai_ask";
    public static final String EVENT_AI_RECOMMENDATION_CLICK = "ai_recommendation_click";
}
