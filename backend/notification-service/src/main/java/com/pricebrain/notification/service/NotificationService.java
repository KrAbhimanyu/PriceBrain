package com.pricebrain.notification.service;

import com.pricebrain.notification.controller.NotificationController.*;
import com.pricebrain.notification.dto.NotificationDTOs.*;
import com.pricebrain.notification.channel.EmailChannel;
import com.pricebrain.notification.channel.PushChannel;
import com.pricebrain.notification.channel.SmsChannel;
import com.pricebrain.notification.repository.NotificationPreferencesRepository;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.document.NotificationDocument;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Notification service implementing business logic for notifications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final MongoTemplate mongoTemplate;
    private final RedisService redisService;
    private final NotificationPreferencesRepository preferencesRepository;
    private final EmailChannel emailChannel;
    private final PushChannel pushChannel;
    private final SmsChannel smsChannel;

    // ==================== NOTIFICATIONS ====================

    /**
     * Get user notifications with pagination.
     */
    public NotificationListDTO getNotifications(UUID userId, Boolean unreadOnly, String type, int page, int size) {
        log.info("Getting notifications for user: {}, unreadOnly: {}, type: {}", userId, unreadOnly, type);

        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId));
        
        if (unreadOnly != null && unreadOnly) {
            query.addCriteria(Criteria.where("isRead").is(false));
        }
        if (type != null && !type.isEmpty()) {
            query.addCriteria(Criteria.where("type").is(type));
        }

        // Get total count
        long total = mongoTemplate.count(query, NotificationDocument.class);

        // Get paginated results
        query.with(PageRequest.of(page, size));
        List<NotificationDocument> notifications = mongoTemplate.find(query, NotificationDocument.class);

        // Get unread count
        Query unreadQuery = new Query(Criteria.where("userId").is(userId).and("isRead").is(false));
        long unreadCount = mongoTemplate.count(unreadQuery, NotificationDocument.class);

        return NotificationListDTO.builder()
                .notifications(notifications.stream().map(this::toDTO).toList())
                .page(page)
                .size(size)
                .totalElements(total)
                .totalPages((int) Math.ceil((double) total / size))
                .unreadCount(unreadCount)
                .build();
    }

    /**
     * Get unread notification count.
     */
    public long getUnreadCount(UUID userId) {
        Query query = new Query(Criteria.where("userId").is(userId).and("isRead").is(false));
        return mongoTemplate.count(query, NotificationDocument.class);
    }

    /**
     * Mark notification as read.
     */
    public void markAsRead(UUID notificationId, UUID userId) {
        log.info("Mark notification as read: {} for user: {}", notificationId, userId);

        Query query = Query.query(
                Criteria.where("id").is(notificationId).and("userId").is(userId)
        );
        Update update = new Update()
                .set("isRead", true)
                .set("readAt", Instant.now());

        mongoTemplate.updateFirst(query, update, NotificationDocument.class);

        // Clear unread count cache
        redisService.delete("notifications:unread:" + userId);
    }

    /**
     * Mark all notifications as read.
     */
    public void markAllAsRead(UUID userId) {
        log.info("Mark all notifications as read for user: {}", userId);

        Query query = Query.query(
                Criteria.where("userId").is(userId).and("isRead").is(false)
        );
        Update update = new Update()
                .set("isRead", true)
                .set("readAt", Instant.now());

        mongoTemplate.updateMulti(query, update, NotificationDocument.class);

        // Clear cache
        redisService.delete("notifications:unread:" + userId);
    }

    /**
     * Delete notification.
     */
    public void deleteNotification(UUID notificationId, UUID userId) {
        log.info("Delete notification: {} for user: {}", notificationId, userId);

        Query query = Query.query(
                Criteria.where("id").is(notificationId).and("userId").is(userId)
        );
        mongoTemplate.remove(query, NotificationDocument.class);

        // Clear cache
        redisService.delete("notifications:unread:" + userId);
    }

    /**
     * Delete all read notifications.
     */
    public int deleteReadNotifications(UUID userId) {
        log.info("Delete read notifications for user: {}", userId);

        Query query = Query.query(
                Criteria.where("userId").is(userId).and("isRead").is(true)
        );
        var result = mongoTemplate.remove(query, NotificationDocument.class);

        // Clear cache
        redisService.delete("notifications:unread:" + userId);

        return (int) result.getDeletedCount();
    }

    // ==================== PREFERENCES ====================

    /**
     * Get notification preferences.
     */
    public NotificationPreferencesDTO getPreferences(UUID userId) {
        log.info("Getting preferences for user: {}", userId);

        var prefs = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        return toPreferencesDTO(prefs);
    }

    /**
     * Update notification preferences.
     */
    public NotificationPreferencesDTO updatePreferences(UUID userId, UpdatePreferencesRequest request) {
        log.info("Updating preferences for user: {}", userId);

        var prefs = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        if (request.getEmailEnabled() != null) prefs.setEmailEnabled(request.getEmailEnabled());
        if (request.getPushEnabled() != null) prefs.setPushEnabled(request.getPushEnabled());
        if (request.getSmsEnabled() != null) prefs.setSmsEnabled(request.getSmsEnabled());
        if (request.getOrderUpdates() != null) prefs.setOrderUpdates(request.getOrderUpdates());
        if (request.getPromotional() != null) prefs.setPromotional(request.getPromotional());
        if (request.getPriceAlerts() != null) prefs.setPriceAlerts(request.getPriceAlerts());
        if (request.getWishlistUpdates() != null) prefs.setWishlistUpdates(request.getWishlistUpdates());
        if (request.getRecommendationUpdates() != null) prefs.setRecommendationUpdates(request.getRecommendationUpdates());
        if (request.getQuietHoursEnabled() != null) prefs.setQuietHoursEnabled(request.getQuietHoursEnabled());
        if (request.getQuietHoursStart() != null) prefs.setQuietHoursStart(request.getQuietHoursStart());
        if (request.getQuietHoursEnd() != null) prefs.setQuietHoursEnd(request.getQuietHoursEnd());

        prefs = preferencesRepository.save(prefs);

        log.info("Preferences updated for user: {}", userId);
        return toPreferencesDTO(prefs);
    }

    // ==================== SEND NOTIFICATIONS ====================

    /**
     * Send notification to user via all enabled channels.
     */
    public void sendNotification(UUID userId, String type, String title, String message, String data) {
        log.info("Sending notification to user: {}, type: {}", userId, type);

        var prefs = preferencesRepository.findByUserId(userId).orElse(null);
        if (prefs == null) {
            prefs = createDefaultPreferences(userId);
        }

        // Save to MongoDB
        NotificationDocument notification = NotificationDocument.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .data(data)
                .isRead(false)
                .createdAt(Instant.now())
                .build();
        mongoTemplate.save(notification);

        // Send via enabled channels
        if (Boolean.TRUE.equals(prefs.getPushEnabled())) {
            pushChannel.send(userId, title, message);
        }
        if (Boolean.TRUE.equals(prefs.getEmailEnabled())) {
            emailChannel.send(userId, title, message);
        }
        if (Boolean.TRUE.equals(prefs.getSmsEnabled())) {
            smsChannel.send(userId, message);
        }

        // Clear unread count cache
        redisService.delete("notifications:unread:" + userId);
    }

    // ==================== HELPERS ====================

    /**
     * Create default notification preferences.
     */
    private com.pricebrain.notification.repository.NotificationPreferences createDefaultPreferences(UUID userId) {
        var prefs = com.pricebrain.notification.repository.NotificationPreferences.builder()
                .userId(userId)
                .emailEnabled(true)
                .pushEnabled(true)
                .smsEnabled(false)
                .orderUpdates(true)
                .promotional(true)
                .priceAlerts(true)
                .wishlistUpdates(true)
                .recommendationUpdates(true)
                .quietHoursEnabled(false)
                .build();
        return preferencesRepository.save(prefs);
    }

    /**
     * Convert NotificationDocument to DTO.
     */
    private NotificationDTO toDTO(NotificationDocument doc) {
        return NotificationDTO.builder()
                .id(doc.getId())
                .userId(doc.getUserId())
                .type(doc.getType())
                .category(doc.getCategory())
                .title(doc.getTitle())
                .message(doc.getMessage())
                .imageUrl(doc.getImageUrl())
                .actionUrl(doc.getActionUrl())
                .actionText(doc.getActionText())
                .isRead(doc.getIsRead())
                .isPinned(doc.getIsPinned())
                .readAt(doc.getReadAt())
                .createdAt(doc.getCreatedAt())
                .build();
    }

    /**
     * Convert preferences to DTO.
     */
    private NotificationPreferencesDTO toPreferencesDTO(
            com.pricebrain.notification.repository.NotificationPreferences prefs) {
        return NotificationPreferencesDTO.builder()
                .userId(prefs.getUserId())
                .emailEnabled(prefs.getEmailEnabled())
                .pushEnabled(prefs.getPushEnabled())
                .smsEnabled(prefs.getSmsEnabled())
                .orderUpdates(prefs.getOrderUpdates())
                .promotional(prefs.getPromotional())
                .priceAlerts(prefs.getPriceAlerts())
                .wishlistUpdates(prefs.getWishlistUpdates())
                .recommendationUpdates(prefs.getRecommendationUpdates())
                .quietHoursEnabled(prefs.getQuietHoursEnabled())
                .quietHoursStart(prefs.getQuietHoursStart())
                .quietHoursEnd(prefs.getQuietHoursEnd())
                .build();
    }
}
