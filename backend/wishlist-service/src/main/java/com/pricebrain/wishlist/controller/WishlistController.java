package com.pricebrain.wishlist.controller;

import com.pricebrain.wishlist.dto.WishlistDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import com.pricebrain.wishlist.service.WishlistService;
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
 * Wishlist API endpoints for managing user wishlists.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/wishlists")
@RequiredArgsConstructor
@Tag(name = "Wishlists", description = "Wishlist Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class WishlistController extends BaseController {

    private final WishlistService wishlistService;

    @Operation(summary = "Get user's wishlists")
    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistDTO>>> getWishlists(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get wishlists for user: {}", userId);
        List<WishlistDTO> wishlists = wishlistService.getWishlists(userId);
        return success(wishlists);
    }

    @Operation(summary = "Get wishlist by ID")
    @GetMapping("/{wishlistId}")
    public ResponseEntity<ApiResponse<WishlistDTO>> getWishlist(
            @PathVariable UUID wishlistId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get wishlist: {} for user: {}", wishlistId, userId);
        WishlistDTO wishlist = wishlistService.getWishlist(wishlistId, userId);
        return success(wishlist);
    }

    @Operation(summary = "Create wishlist")
    @PostMapping
    public ResponseEntity<ApiResponse<WishlistDTO>> createWishlist(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody CreateWishlistRequest request) {

        log.info("Create wishlist for user: {}", userId);
        WishlistDTO wishlist = wishlistService.createWishlist(userId, request);
        return created(wishlist, "Wishlist created successfully");
    }

    @Operation(summary = "Update wishlist")
    @PutMapping("/{wishlistId}")
    public ResponseEntity<ApiResponse<WishlistDTO>> updateWishlist(
            @PathVariable UUID wishlistId,
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody UpdateWishlistRequest request) {

        log.info("Update wishlist: {} for user: {}", wishlistId, userId);
        WishlistDTO wishlist = wishlistService.updateWishlist(wishlistId, userId, request);
        return success(wishlist, "Wishlist updated successfully");
    }

    @Operation(summary = "Delete wishlist")
    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<ApiResponse<Void>> deleteWishlist(
            @PathVariable UUID wishlistId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Delete wishlist: {} for user: {}", wishlistId, userId);
        wishlistService.deleteWishlist(wishlistId, userId);
        return success("Wishlist deleted successfully");
    }

    @Operation(summary = "Add item to wishlist")
    @PostMapping("/{wishlistId}/items")
    public ResponseEntity<ApiResponse<WishlistItemDTO>> addItem(
            @PathVariable UUID wishlistId,
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody AddWishlistItemRequest request) {

        log.info("Add item to wishlist: {}, product: {}", wishlistId, request.getProductId());
        WishlistItemDTO item = wishlistService.addItem(wishlistId, userId, request);
        return created(item, "Item added to wishlist");
    }

    @Operation(summary = "Remove item from wishlist")
    @DeleteMapping("/{wishlistId}/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @PathVariable UUID wishlistId,
            @PathVariable UUID itemId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Remove item: {} from wishlist: {}", itemId, wishlistId);
        wishlistService.removeItem(wishlistId, itemId, userId);
        return success("Item removed from wishlist");
    }

    @Operation(summary = "Update item in wishlist")
    @PutMapping("/{wishlistId}/items/{itemId}")
    public ResponseEntity<ApiResponse<WishlistItemDTO>> updateItem(
            @PathVariable UUID wishlistId,
            @PathVariable UUID itemId,
            @RequestHeader("X-User-ID") UUID userId,
            @RequestBody UpdateWishlistItemRequest request) {

        log.info("Update item: {} in wishlist: {}", itemId, wishlistId);
        WishlistItemDTO item = wishlistService.updateItem(wishlistId, itemId, userId, request);
        return success(item, "Item updated");
    }

    @Operation(summary = "Move item to cart")
    @PostMapping("/{wishlistId}/items/{itemId}/move-to-cart")
    public ResponseEntity<ApiResponse<Void>> moveToCart(
            @PathVariable UUID wishlistId,
            @PathVariable UUID itemId,
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "1") Integer quantity) {

        log.info("Move item: {} to cart from wishlist: {}", itemId, wishlistId);
        wishlistService.moveToCart(wishlistId, itemId, userId, quantity);
        return success("Item moved to cart");
    }

    @Operation(summary = "Share wishlist")
    @PostMapping("/{wishlistId}/share")
    public ResponseEntity<ApiResponse<String>> shareWishlist(
            @PathVariable UUID wishlistId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Share wishlist: {}", wishlistId);
        String shareUrl = wishlistService.shareWishlist(wishlistId, userId);
        return success(shareUrl);
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Wishlist details")
    public static class WishlistDTO {
        private UUID id;
        private UUID userId;
        private String name;
        private String description;
        private Boolean isPublic;
        private String shareUrl;
        private Integer itemCount;
        private Integer alertEnabledItems;
        private List<WishlistItemDTO> items;
        private java.time.Instant createdAt;
        private java.time.Instant updatedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Wishlist item")
    public static class WishlistItemDTO {
        private UUID id;
        private UUID wishlistId;
        private UUID productId;
        private String productName;
        private String productImage;
        private Double price;
        private Double originalPrice;
        private Double discountPercent;
        private Integer stockStatus; // 0=out, 1=low, 2=in
        private Double targetPrice;
        private Boolean priceAlertEnabled;
        private Boolean inStock;
        private Integer quantity;
        private java.time.Instant addedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Create wishlist request")
    public static class CreateWishlistRequest {
        private String name;
        private String description;
        private Boolean isPublic;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update wishlist request")
    public static class UpdateWishlistRequest {
        private String name;
        private String description;
        private Boolean isPublic;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Add item request")
    public static class AddWishlistItemRequest {
        private UUID productId;
        private Double targetPrice;
        private Boolean priceAlertEnabled;
        private Integer quantity;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update item request")
    public static class UpdateWishlistItemRequest {
        private Double targetPrice;
        private Boolean priceAlertEnabled;
        private Integer quantity;
    }
}
