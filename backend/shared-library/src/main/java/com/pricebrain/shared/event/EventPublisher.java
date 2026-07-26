package com.pricebrain.shared.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Event publisher for Kafka messaging.
 * Publishes domain events to Kafka topics for inter-service communication.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    // Topic names
    public static final String TOPIC_USER_CREATED = "user.created";
    public static final String TOPIC_USER_UPDATED = "user.updated";
    public static final String TOPIC_USER_LOGIN = "user.login";
    public static final String TOPIC_PRODUCT_CREATED = "product.created";
    public static final String TOPIC_PRODUCT_UPDATED = "product.updated";
    public static final String TOPIC_PRODUCT_PRICE_CHANGED = "product.price_changed";
    public static final String TOPIC_PRODUCT_VIEWED = "product.viewed";
    public static final String TOPIC_ORDER_CREATED = "order.created";
    public static final String TOPIC_ORDER_STATUS_CHANGED = "order.status_changed";
    public static final String TOPIC_ORDER_PAYMENT_SUCCESS = "order.payment_success";
    public static final String TOPIC_ORDER_PAYMENT_FAILED = "order.payment_failed";
    public static final String TOPIC_ORDER_CANCELLED = "order.cancelled";
    public static final String TOPIC_CART_ITEM_ADDED = "cart.item_added";
    public static final String TOPIC_CART_ITEM_REMOVED = "cart.item_removed";
    public static final String TOPIC_CART_CLEARED = "cart.cleared";
    public static final String TOPIC_WISHLIST_ITEM_ADDED = "wishlist.item_added";
    public static final String TOPIC_NOTIFICATION = "notification";
    public static final String TOPIC_AI_CONVERSATION = "ai.conversation";
    public static final String TOPIC_AI_RECOMMENDATION_CLICKED = "ai.recommendation_clicked";
    public static final String TOPIC_SEARCH = "analytics.search";
    public static final String TOPIC_PAGE_VIEW = "analytics.page_view";

    /**
     * Publish user created event.
     */
    public void publishUserCreated(DomainEvents.UserCreatedEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_USER_CREATED, event.getUserId().toString(), event);
    }

    /**
     * Publish user login event.
     */
    public void publishUserLogin(DomainEvents.UserLoginEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_USER_LOGIN, event.getUserId().toString(), event);
    }

    /**
     * Publish product created event.
     */
    public void publishProductCreated(DomainEvents.ProductCreatedEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_PRODUCT_CREATED, event.getProductId().toString(), event);
    }

    /**
     * Publish product updated event.
     */
    public void publishProductUpdated(DomainEvents.ProductUpdatedEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_PRODUCT_UPDATED, event.getProductId().toString(), event);
    }

    /**
     * Publish product price changed event.
     */
    public void publishProductPriceChanged(DomainEvents.ProductPriceChangedEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_PRODUCT_PRICE_CHANGED, event.getProductId().toString(), event);
    }

    /**
     * Publish product viewed event.
     */
    public void publishProductViewed(DomainEvents.ProductViewedEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_PRODUCT_VIEWED, event.getProductId().toString(), event);
    }

    /**
     * Publish order created event.
     */
    public void publishOrderCreated(DomainEvents.OrderCreatedEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_ORDER_CREATED, event.getOrderId().toString(), event);
    }

    /**
     * Publish order status changed event.
     */
    public void publishOrderStatusChanged(DomainEvents.OrderStatusChangedEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_ORDER_STATUS_CHANGED, event.getOrderId().toString(), event);
    }

    /**
     * Publish order payment success event.
     */
    public void publishOrderPaymentSuccess(DomainEvents.OrderPaymentSuccessEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_ORDER_PAYMENT_SUCCESS, event.getOrderId().toString(), event);
    }

    /**
     * Publish order cancelled event.
     */
    public void publishOrderCancelled(DomainEvents.OrderCancelledEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_ORDER_CANCELLED, event.getOrderId().toString(), event);
    }

    /**
     * Publish cart item added event.
     */
    public void publishCartItemAdded(DomainEvents.CartItemAddedEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_CART_ITEM_ADDED, event.getUserId().toString(), event);
    }

    /**
     * Publish notification event.
     */
    public void publishNotification(DomainEvents.NotificationEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_NOTIFICATION, event.getUserId().toString(), event);
    }

    /**
     * Publish AI conversation event.
     */
    public void publishAIConversation(DomainEvents.AIConversationEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_AI_CONVERSATION, event.getSessionId(), event);
    }

    /**
     * Publish search event.
     */
    public void publishSearch(DomainEvents.SearchEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_SEARCH, event.getUserId() != null ? event.getUserId().toString() : event.getSessionId(), event);
    }

    /**
     * Publish page view event.
     */
    public void publishPageView(DomainEvents.PageViewEvent event) {
        event.setEventId(UUID.randomUUID());
        event.setTimestamp(java.time.Instant.now());
        publish(TOPIC_PAGE_VIEW, event.getUserId() != null ? event.getUserId().toString() : event.getSessionId(), event);
    }

    /**
     * Generic publish method.
     */
    private <T> void publish(String topic, String key, T event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            
            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topic, key, message);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.debug("Event published to topic {}: key={}, partition={}, offset={}",
                            topic, key,
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to publish event to topic {}: {}", topic, ex.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("Error serializing event for topic {}: {}", topic, e.getMessage());
        }
    }

    /**
     * Publish event synchronously (blocking).
     */
    public <T> void publishSync(String topic, String key, T event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            SendResult<String, String> result = kafkaTemplate.send(topic, key, message).get();
            log.debug("Event published synchronously to topic {}: key={}, partition={}, offset={}",
                    topic, key,
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
        } catch (Exception e) {
            log.error("Error publishing event synchronously to topic {}: {}", topic, e.getMessage());
            throw new RuntimeException("Failed to publish event", e);
        }
    }
}
