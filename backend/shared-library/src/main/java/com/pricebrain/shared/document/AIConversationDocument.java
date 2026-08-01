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
 * MongoDB document for AI conversations.
 */
@Document(collection = "conversations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "user_session", def = "{'userId': 1, 'sessionId': 1}")
@CompoundIndex(name = "user_created", def = "{'userId': 1, 'createdAt': -1}")
public class AIConversationDocument {

    @Id
    private String id;

    @Indexed
    private UUID userId;

    @Indexed
    private String sessionId;

    private ConversationType type;

    private List<ConversationMessage> messages;

    private ConversationContext context;

    private ConversationMetadata metadata;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant endedAt;

    public enum ConversationType {
        ASK_BRAIN,
        FASHION_STYLIST,
        PRICE_MONITOR,
        PRODUCT_COMPARISON,
        CUSTOMER_SUPPORT
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationMessage {
        private MessageRole role;
        private String content;
        private List<String> attachments;
        private Map<String, Object> metadata;
        private Instant createdAt;

        public enum MessageRole {
            USER,
            ASSISTANT,
            SYSTEM
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationContext {
        private List<UUID> currentProducts;
        private Map<String, Object> preferences;
        private List<Map<String, Object>> conversationHistory;
        private UUID selectedProductId;
        private String searchQuery;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationMetadata {
        private int totalTokens;
        private String model;
        private Double confidence;
        private int messageCount;
        private int userMessageCount;
        private int assistantMessageCount;
    }
}
