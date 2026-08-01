package com.pricebrain.ai.controller;

import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwgResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * AI Service API endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI Services APIs")
@SecurityRequirement(name = "bearerAuth")
public class AIController extends BaseController {

    // ==================== ASK BRAIN ====================

    @Operation(
            summary = "Ask Brain AI",
            description = """
                    Conversational AI assistant for product discovery and recommendations.
                    
                    **Features:**
                    - Natural language product search
                    - Personalized recommendations
                    - Price comparisons
                    - Fashion styling advice
                    - Product comparisons
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Response generated successfully"),
            @SwgResponse(responseCode = "400", description = "Invalid request"),
            @SwgResponse(responseCode = "503", description = "AI service unavailable")
    })
    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<AIChatResponse>> askBrain(
            @RequestBody AIChatRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Ask Brain request from user: {}", userId);

        // TODO: Implement Ask Brain
        AIChatResponse response = AIChatResponse.builder()
                .message("Based on your preferences, I recommend the following products...")
                .type("PRODUCT_RECOMMENDATION")
                .confidence(0.92)
                .suggestions(List.of(
                        AIProductSuggestion.builder()
                                .productId(UUID.randomUUID())
                                .name("iPhone 15 Pro")
                                .reason("Best rated phone under 100K")
                                .price(BigDecimal.valueOf(99900.00))
                                .build()
                ))
                .build();

        return success(response);
    }

    @Operation(summary = "Get conversation history")
    @GetMapping("/conversations/{sessionId}")
    public ResponseEntity<ApiResponse<AIConversationDTO>> getConversation(
            @PathVariable String sessionId,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get conversation: {} for user: {}", sessionId, userId);

        // TODO: Implement get conversation
        return success(AIConversationDTO.builder()
                .sessionId(sessionId)
                .messages(List.of())
                .build());
    }

    @Operation(summary = "End conversation")
    @DeleteMapping("/conversations/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> endConversation(
            @PathVariable String sessionId,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("End conversation: {}", sessionId);

        // TODO: Implement end conversation
        return success("Conversation ended");
    }

    // ==================== PRODUCT RECOMMENDATIONS ====================

    @Operation(
            summary = "Get personalized recommendations",
            description = """
                    AI-powered personalized product recommendations.
                    
                    **Recommendation Types:**
                    - `FOR_YOU` - Based on browsing/purchase history
                    - `TRENDING` - Popular products
                    - `SIMILAR` - Similar to viewed products
                    - `COMPLIMENTARY` - Products that go well together
                    - `REORDER` - Frequently purchased items
                    """
    )
    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<RecommendationsDTO>> getRecommendations(
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId,
            
            @Parameter(description = "Recommendation type")
            @RequestParam(defaultValue = "FOR_YOU") String type,
            
            @Parameter(description = "Category ID (optional filter)")
            @RequestParam(required = false) UUID categoryId,
            
            @Parameter(description = "Number of recommendations")
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Get {} recommendations for user: {}", type, userId);

        // TODO: Implement recommendations
        return success(RecommendationsDTO.builder()
                .type(type)
                .recommendations(List.of())
                .build());
    }

    @Operation(summary = "Get similar products")
    @GetMapping("/products/{productId}/similar")
    public ResponseEntity<ApiResponse<List<SimilarProductDTO>>> getSimilarProducts(
            @PathVariable UUID productId,
            @Parameter(description = "Number of products")
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Get similar products for: {}", productId);

        // TODO: Implement similar products
        return success(List.of());
    }

    @Operation(summary = "Get frequently bought together")
    @GetMapping("/products/{productId}/frequently-bought")
    public ResponseEntity<ApiResponse<List<FrequentlyBoughtDTO>>> getFrequentlyBoughtTogether(
            @PathVariable UUID productId) {

        log.info("Get frequently bought together for: {}", productId);

        // TODO: Implement frequently bought together
        return success(List.of());
    }

    // ==================== PRICE INTELLIGENCE ====================

    @Operation(
            summary = "Get price prediction",
            description = "Predict future price trends using AI"
    )
    @GetMapping("/products/{productId}/price-prediction")
    public ResponseEntity<ApiResponse<PricePredictionDTO>> getPricePrediction(
            @PathVariable UUID productId) {

        log.info("Get price prediction for: {}", productId);

        // TODO: Implement price prediction
        return success(PricePredictionDTO.builder()
                .productId(productId)
                .currentPrice(BigDecimal.valueOf(999.00))
                .predictedPrice(BigDecimal.valueOf(899.00))
                .confidence(0.85)
                .predictionDate(java.time.LocalDate.now().plusDays(30))
                .trend("DECREASING")
                .build());
    }

    @Operation(summary = "Set price alert")
    @PostMapping("/alerts/price")
    public ResponseEntity<ApiResponse<PriceAlertDTO>> setPriceAlert(
            @RequestBody SetPriceAlertRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Set price alert for user: {}", userId);

        // TODO: Implement price alert
        return created(PriceAlertDTO.builder()
                .alertId(UUID.randomUUID())
                .productId(request.getProductId())
                .targetPrice(request.getTargetPrice())
                .status("ACTIVE")
                .build());
    }

    @Operation(summary = "Get active price alerts")
    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<PriceAlertDTO>>> getAlerts(
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get alerts for user: {}", userId);

        // TODO: Implement get alerts
        return success(List.of());
    }

    // ==================== AI MISSIONS ====================

    @Operation(
            summary = "Create AI Mission",
            description = """
                    Create an ongoing AI task (Mission).
                    
                    **Mission Types:**
                    - `PRICE_MONITOR` - Track price changes
                    - `STOCK_ALERT` - Notify when back in stock
                    - `NEW_PRODUCT` - Notify new arrivals in category
                    - `WISHLIST_TRACK` - Track wishlist item prices
                    """
    )
    @PostMapping("/missions")
    public ResponseEntity<ApiResponse<AIMissionDTO>> createMission(
            @RequestBody CreateMissionRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Create AI mission: {} for user: {}", request.getType(), userId);

        // TODO: Implement create mission
        return created(AIMissionDTO.builder()
                .missionId(UUID.randomUUID())
                .type(request.getType())
                .status("ACTIVE")
                .createdAt(java.time.Instant.now())
                .build());
    }

    @Operation(summary = "Get AI missions")
    @GetMapping("/missions")
    public ResponseEntity<ApiResponse<List<AIMissionDTO>>> getMissions(
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId,
            @Parameter(description = "Mission status filter")
            @RequestParam(required = false) String status) {

        log.info("Get missions for user: {}", userId);

        // TODO: Implement get missions
        return success(List.of());
    }

    @Operation(summary = "Update AI mission")
    @PutMapping("/missions/{missionId}")
    public ResponseEntity<ApiResponse<AIMissionDTO>> updateMission(
            @PathVariable UUID missionId,
            @RequestBody UpdateMissionRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Update mission: {}", missionId);

        // TODO: Implement update mission
        return success(AIMissionDTO.builder()
                .missionId(missionId)
                .status(request.getStatus())
                .build());
    }

    @Operation(summary = "Delete AI mission")
    @DeleteMapping("/missions/{missionId}")
    public ResponseEntity<ApiResponse<Void>> deleteMission(
            @PathVariable UUID missionId,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Delete mission: {}", missionId);

        // TODO: Implement delete mission
        return success("Mission deleted");
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "AI chat request")
    public static class AIChatRequest {
        @Schema(description = "Session ID (new session if null)")
        private String sessionId;
        
        @Schema(description = "User message")
        private String message;
        
        @Schema(description = "Current context (product IDs)")
        private List<UUID> contextProductIds;
        
        @Schema(description = "Conversation type")
        private String type;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "AI chat response")
    public static class AIChatResponse {
        private String message;
        private String type;
        private Double confidence;
        private List<AIProductSuggestion> suggestions;
        private Map<String, Object> metadata;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "AI product suggestion")
    public static class AIProductSuggestion {
        private UUID productId;
        private String name;
        private String reason;
        private BigDecimal price;
        private String imageUrl;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "AI conversation")
    public static class AIConversationDTO {
        private String sessionId;
        private List<AIChatMessage> messages;
        private java.time.Instant createdAt;
        private java.time.Instant endedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "AI chat message")
    public static class AIChatMessage {
        private String role;
        private String content;
        private List<AIProductSuggestion> suggestions;
        private java.time.Instant timestamp;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Recommendations response")
    public static class RecommendationsDTO {
        private String type;
        private List<AIProductSuggestion> recommendations;
        private String reason;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Similar product")
    public static class SimilarProductDTO {
        private UUID productId;
        private String name;
        private BigDecimal price;
        private Double similarityScore;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Frequently bought together")
    public static class FrequentlyBoughtDTO {
        private UUID productId;
        private String name;
        private BigDecimal price;
        private Integer purchaseCount;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Price prediction")
    public static class PricePredictionDTO {
        private UUID productId;
        private BigDecimal currentPrice;
        private BigDecimal predictedPrice;
        private Double confidence;
        private java.time.LocalDate predictionDate;
        private String trend;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Price alert request")
    public static class SetPriceAlertRequest {
        private UUID productId;
        private BigDecimal targetPrice;
        private Boolean notifyOnDrop;
        private Boolean notifyOnIncrease;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Price alert")
    public static class PriceAlertDTO {
        private UUID alertId;
        private UUID productId;
        private BigDecimal targetPrice;
        private String status;
        private java.time.Instant triggeredAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Create mission request")
    public static class CreateMissionRequest {
        @Schema(description = "Mission type")
        private String type;
        
        private String name;
        private String description;
        private Map<String, Object> config;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update mission request")
    public static class UpdateMissionRequest {
        private String status;
        private Map<String, Object> config;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "AI Mission")
    public static class AIMissionDTO {
        private UUID missionId;
        private String type;
        private String name;
        private String status;
        private Map<String, Object> config;
        private java.time.Instant lastRunAt;
        private java.time.Instant nextRunAt;
        private java.time.Instant createdAt;
    }
}
