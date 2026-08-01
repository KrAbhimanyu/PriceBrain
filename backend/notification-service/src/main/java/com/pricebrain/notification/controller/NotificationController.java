package com.pricebrain.notification.controller;

import com.pricebrain.notification.dto.NotificationDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import com.pricebrain.notification.service.NotificationService;
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

import java.util.List;
import java.util.UUID;

/**
 * Notification API endpoints for managing notifications.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController extends BaseController {

    private final NotificationService notificationService;

    // ==================== NOTIFICATIONS ====================

    @Operation(summary = "Get user notifications")
    @GetMapping
    public ResponseEntity<ApiResponse<NotificationListDTO>> getNotifications(
            @RequestHeader("X-User-ID") UUID userId,
            @Parameter(description = "Filter by read status")
            @RequestParam(required = false) Boolean unreadOnly,
            @Parameter(description = "Filter by type")
            @RequestParam(required = false) String type,
            @Parameter(description = "Page number")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {

        log.info("Get notifications for user: {}, unreadOnly: {}", userId, unreadOnly);
        NotificationListDTO notifications = notificationService.getNotifications(userId, unreadOnly, type, page, size);
        return success(notifications);
    }

    @Operation(summary = "Get unread count")
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get unread count for user: {}", userId);
        long count = notificationService.getUnreadCount(userId);
        return success(count);
    }

    @Operation(summary = "Mark notification as read")
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID notificationId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Mark notification as read: {} for user: {}", notificationId, userId);
        notificationService.markAsRead(notificationId, userId);
        return success("Notification marked as read");
    }

    @Operation(summary = "Mark all notifications as read")
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Mark all notifications as read for user: {}", userId);
        notificationService.markAllAsRead(userId);
        return success("All notifications marked as read");
    }

    @Operation(summary = "Delete notification")
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable UUID notificationId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Delete notification: {} for user: {}", notificationId, userId);
        notificationService.deleteNotification(notificationId, userId);
        return success("Notification deleted");
    }

    @Operation(summary = "Delete all read notifications")
    @DeleteMapping("/delete-read")
    public ResponseEntity<ApiResponse<Void>> deleteReadNotifications(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Delete read notifications for user: {}", userId);
        int count = notificationService.deleteReadNotifications(userId);
        return success("Deleted " + count + " notifications");
    }

    // ==================== PREFERENCES ====================

    @Operation(summary = "Get notification preferences")
    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesDTO>> getPreferences(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get notification preferences for user: {}", userId);
        NotificationPreferencesDTO preferences = notificationService.getPreferences(userId);
        return success(preferences);
    }

    @Operation(summary = "Update notification preferences")
    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesDTO>> updatePreferences(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody UpdatePreferencesRequest request) {

        log.info("Update notification preferences for user: {}", userId);
        NotificationPreferencesDTO preferences = notificationService.updatePreferences(userId, request);
        return success(preferences, "Preferences updated");
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Notification list response")
    public static class NotificationListDTO {
        private List<NotificationDTO> notifications;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private long unreadCount;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Notification details")
    public static class NotificationDTO {
        private UUID id;
        private UUID userId;
        private String type;
        private String category;
        private String title;
        private String message;
        private String imageUrl;
        private String actionUrl;
        private String actionText;
        private Boolean isRead;
        private Boolean isPinned;
        private java.time.Instant readAt;
        private java.time.Instant createdAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Notification preferences")
    public static class NotificationPreferencesDTO {
        private UUID userId;
        private Boolean emailEnabled;
        private Boolean pushEnabled;
        private Boolean smsEnabled;
        private Boolean orderUpdates;
        private Boolean promotional;
        private Boolean priceAlerts;
        private Boolean wishlistUpdates;
        private Boolean recommendationUpdates;
        private Boolean quietHoursEnabled;
        private String quietHoursStart;
        private String quietHoursEnd;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update preferences request")
    public static class UpdatePreferencesRequest {
        private Boolean emailEnabled;
        private Boolean pushEnabled;
        private Boolean smsEnabled;
        private Boolean orderUpdates;
        private Boolean promotional;
        private Boolean priceAlerts;
        private Boolean wishlistUpdates;
        private Boolean recommendationUpdates;
        private Boolean quietHoursEnabled;
        private String quietHoursStart;
        private String quietHoursEnd;
    }
}
