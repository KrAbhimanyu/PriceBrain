package com.pricebrain.shared.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Base class for all domain events in the PriceBrain platform.
 * All events are published to Kafka with a standardized format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public abstract class DomainEvent {

    private String eventId;
    private String eventType;
    private String aggregateType;
    private UUID aggregateId;
    private UUID userId;
    private UUID correlationId;
    private UUID causationId;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Instant timestamp;
    
    private EventMetadata metadata;

    /**
     * Generate event ID if not present.
     */
    public void generateEventId() {
        if (this.eventId == null) {
            this.eventId = UUID.randomUUID().toString();
        }
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }

    /**
     * Get the Kafka topic for this event.
     */
    public abstract String getTopic();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventMetadata {
        private String sourceService;
        private String sourceVersion;
        private String ipAddress;
        private String userAgent;
        private String sessionId;
    }
}
