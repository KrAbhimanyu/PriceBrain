package com.pricebrain.notification.channel;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Email notification channel.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailChannel {

    /**
     * Send email notification.
     */
    public void send(UUID userId, String subject, String body) {
        log.info("Sending email to user: {}, subject: {}", userId, subject);
        // TODO: Implement actual email sending via SMTP or SendGrid
        // For now, just log
    }
}

/**
 * Push notification channel.
 */
@Component
@RequiredArgsConstructor
@Slf4j
class PushChannel {

    /**
     * Send push notification.
     */
    public void send(UUID userId, String title, String body) {
        log.info("Sending push notification to user: {}, title: {}", userId, title);
        // TODO: Implement actual push via Firebase Cloud Messaging
    }
}

/**
 * SMS notification channel.
 */
@Component
@RequiredArgsConstructor
@Slf4j
class SmsChannel {

    /**
     * Send SMS notification.
     */
    public void send(UUID userId, String message) {
        log.info("Sending SMS to user: {}", userId);
        // TODO: Implement actual SMS via Twilio
    }
}
