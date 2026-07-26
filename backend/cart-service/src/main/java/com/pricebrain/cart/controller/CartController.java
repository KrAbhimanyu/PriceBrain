package com.pricebrain.cart.controller;

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
import java.util.UUID;

/**
 * Cart API endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping Cart APIs")
@SecurityRequirement(name = "bearerAuth")
public class CartController extends BaseController {

    @Operation(summary = "Get cart")
    @GetMapping
    public ResponseEntity<ApiResponse<CartDTO>> getCart(
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get cart for user: {}", userId);

        // TODO: Implement get cart
        CartDTO cart = CartDTO.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .itemsCount(3)
                .subtotal(BigDecimal.valueOf(2999.00))
                .discountAmount(BigDecimal.valueOf(100.00))
                .totalAmount(BigDecimal.valueOf(2899.00))
                .build();

        return success(cart);
    }

    @Operation(summary = "Add item to cart")
    @PostMapping("/items")
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Item added successfully"),
            @SwgResponse(responseCode = "400", description = "Invalid product or quantity"),
            @SwgResponse(responseCode = "400", description = "Product out of stock")
    })
    public ResponseEntity<ApiResponse<CartItemDTO>> addItem(
            @RequestBody AddToCartRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Add to cart - user: {}, product: {}", userId, request.getProductId());

        // TODO: Implement add to cart
        CartItemDTO item = CartItemDTO.builder()
                .id(UUID.randomUUID())
                .productId(request.getProductId())
                .productName("Sample Product")
                .quantity(request.getQuantity())
                .unitPrice(BigDecimal.valueOf(999.00))
                .totalPrice(BigDecimal.valueOf(999.00 * request.getQuantity()))
                .build();

        return success(item, "Item added to cart");
    }

    @Operation(summary = "Update cart item quantity")
    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartItemDTO>> updateItem(
            @PathVariable UUID itemId,
            @RequestBody UpdateCartItemRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Update cart item: {} to quantity: {}", itemId, request.getQuantity());

        // TODO: Implement update item
        CartItemDTO item = CartItemDTO.builder()
                .id(itemId)
                .quantity(request.getQuantity())
                .totalPrice(BigDecimal.valueOf(999.00 * request.getQuantity()))
                .build();

        return success(item);
    }

    @Operation(summary = "Remove item from cart")
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @PathVariable UUID itemId,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Remove cart item: {}", itemId);

        // TODO: Implement remove item
        return success("Item removed from cart");
    }

    @Operation(summary = "Clear cart")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Clear cart for user: {}", userId);

        // TODO: Implement clear cart
        return success("Cart cleared");
    }

    @Operation(summary = "Apply coupon")
    @PostMapping("/coupon")
    public ResponseEntity<ApiResponse<CartDTO>> applyCoupon(
            @RequestBody ApplyCouponRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Apply coupon: {} for user: {}", request.getCouponCode(), userId);

        // TODO: Implement apply coupon
        CartDTO cart = CartDTO.builder()
                .id(UUID.randomUUID())
                .discountAmount(BigDecimal.valueOf(200.00))
                .couponCode(request.getCouponCode())
                .build();

        return success(cart, "Coupon applied successfully");
    }

    @Operation(summary = "Remove coupon")
    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<Void>> removeCoupon(
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Remove coupon for user: {}", userId);

        // TODO: Implement remove coupon
        return success("Coupon removed");
    }

    @Operation(
            summary = "Get AI recommendations",
            description = "Get AI-powered product recommendations for cart"
    )
    @GetMapping("/ai/recommendations")
    public ResponseEntity<ApiResponse<List<AIRecommendationDTO>>> getRecommendations(
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId,
            @Parameter(description = "Number of recommendations")
            @RequestParam(defaultValue = "5") int limit) {

        log.info("Get AI recommendations for user: {}", userId);

        // TODO: Implement AI recommendations
        return success(List.of());
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Cart")
    public static class CartDTO {
        private UUID id;
        private UUID userId;
        private List<CartItemDTO> items;
        private Integer itemsCount;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private String couponCode;
        private BigDecimal totalAmount;
        private List<AIRecommendationDTO> aiSuggestions;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Cart item")
    public static class CartItemDTO {
        private UUID id;
        private UUID productId;
        private String productName;
        private String productImage;
        private UUID variantId;
        private String variantName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private Boolean inStock;
        private Boolean aiRecommended;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Add to cart request")
    public static class AddToCartRequest {
        private UUID productId;
        private UUID variantId;
        @Schema(description = "Quantity", example = "1")
        private Integer quantity;
        private Boolean saveForLater;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update cart item request")
    public static class UpdateCartItemRequest {
        @Schema(description = "New quantity", example = "2")
        private Integer quantity;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Apply coupon request")
    public static class ApplyCouponRequest {
        @Schema(description = "Coupon code", example = "SAVE20")
        private String couponCode;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "AI recommendation")
    public static class AIRecommendationDTO {
        private UUID productId;
        private String productName;
        private String reason;
        private BigDecimal price;
        private Double confidence;
    }
}
