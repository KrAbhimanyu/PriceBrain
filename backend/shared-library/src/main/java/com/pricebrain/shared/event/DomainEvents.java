package com.pricebrain.shared.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.springframework.context.ApplicationEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Domain events for PriceBrain event-driven architecture.
 * These events are published to Kafka for inter-service communication.
 */
public class DomainEvents {

    // ==================== USER EVENTS ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserCreatedEvent {
        private UUID eventId;
        private UUID userId;
        private String email;
        private String role;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
        private Map<String, Object> metadata;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserVerifiedEvent {
        private UUID eventId;
        private UUID userId;
        private String email;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserLoginEvent {
        private UUID eventId;
        private UUID userId;
        private String email;
        private String ipAddress;
        private String deviceId;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    // ==================== PRODUCT EVENTS ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductCreatedEvent {
        private UUID eventId;
        private UUID productId;
        private UUID sellerId;
        private String name;
        private String slug;
        private UUID categoryId;
        private UUID brandId;
        private BigDecimal price;
        private String status;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductUpdatedEvent {
        private UUID eventId;
        private UUID productId;
        private UUID sellerId;
        private String updatedFields;
        private Map<String, Object> oldValues;
        private Map<String, Object> newValues;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductPriceChangedEvent {
        private UUID eventId;
        private UUID productId;
        private BigDecimal oldPrice;
        private BigDecimal newPrice;
        private BigDecimal discountPercent;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductViewedEvent {
        private UUID eventId;
        private UUID productId;
        private UUID userId;
        private String sessionId;
        private String source;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    // ==================== ORDER EVENTS ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderCreatedEvent {
        private UUID eventId;
        private UUID orderId;
        private String orderNumber;
        private UUID userId;
        private BigDecimal totalAmount;
        private String paymentMethod;
        private List<OrderItemEvent> items;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemEvent {
        private UUID productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusChangedEvent {
        private UUID eventId;
        private UUID orderId;
        private String orderNumber;
        private String oldStatus;
        private String newStatus;
        private UUID userId;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderPaymentSuccessEvent {
        private UUID eventId;
        private UUID orderId;
        private String orderNumber;
        private UUID userId;
        private BigDecimal amount;
        private String paymentId;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderPaymentFailedEvent {
        private UUID eventId;
        private UUID orderId;
        private String orderNumber;
        private UUID userId;
        private String reason;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderCancelledEvent {
        private UUID eventId;
        private UUID orderId;
        private String orderNumber;
        private UUID userId;
        private String reason;
        private BigDecimal refundAmount;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    // ==================== CART EVENTS ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemAddedEvent {
        private UUID eventId;
        private UUID userId;
        private UUID productId;
        private Integer quantity;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemRemovedEvent {
        private UUID eventId;
        private UUID userId;
        private UUID productId;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartClearedEvent {
        private UUID eventId;
        private UUID userId;
        private Integer itemsCount;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    // ==================== WISHLIST EVENTS ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WishlistItemAddedEvent {
        private UUID eventId;
        private UUID userId;
        private UUID productId;
        private BigDecimal targetPrice;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    // ==================== NOTIFICATION EVENTS ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationEvent {
        private UUID eventId;
        private UUID userId;
        private String type;
        private String title;
        private String message;
        private Map<String, Object> data;
        private List<String> channels;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    // ==================== AI EVENTS ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIConversationEvent {
        private UUID eventId;
        private UUID userId;
        private String sessionId;
        private String type;
        private String userMessage;
        private String aiResponse;
        private List<UUID> recommendedProducts;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIRecommendationClickedEvent {
        private UUID eventId;
        private UUID userId;
        private UUID productId;
        private String recommendationType;
        private Double confidence;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    // ==================== ANALYTICS EVENTS ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchEvent {
        private UUID eventId;
        private UUID userId;
        private String sessionId;
        private String query;
        private Integer resultsCount;
        private Long responseTimeMs;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageViewEvent {
        private UUID eventId;
        private UUID userId;
        private String sessionId;
        private String page;
        private String referrer;
        private String device;
        private String browser;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant timestamp;
    }
}
