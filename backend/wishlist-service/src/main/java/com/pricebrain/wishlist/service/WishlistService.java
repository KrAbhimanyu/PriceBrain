package com.pricebrain.wishlist.service;

import com.pricebrain.wishlist.controller.WishlistController.*;
import com.pricebrain.wishlist.repository.WishlistRepository;
import com.pricebrain.wishlist.repository.WishlistItemRepository;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.Wishlist;
import com.pricebrain.shared.model.WishlistItem;
import com.pricebrain.shared.model.Product;
import com.pricebrain.shared.repository.ProductRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Wishlist service implementing business logic for wishlists.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final RedisService redisService;

    // ==================== WISHLISTS ====================

    /**
     * Get all wishlists for user.
     */
    @Transactional(readOnly = true)
    public List<WishlistDTO> getWishlists(UUID userId) {
        log.info("Getting wishlists for user: {}", userId);

        List<Wishlist> wishlists = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return wishlists.stream().map(this::toWishlistDTO).toList();
    }

    /**
     * Get wishlist by ID.
     */
    @Transactional(readOnly = true)
    public WishlistDTO getWishlist(UUID wishlistId, UUID userId) {
        log.info("Getting wishlist: {} for user: {}", wishlistId, userId);

        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_001));

        // Verify ownership
        if (!wishlist.getUserId().equals(userId)) {
            throw new WishlistException(ErrorCodes.AUTHZ_004);
        }

        return toWishlistDTO(wishlist);
    }

    /**
     * Create new wishlist.
     */
    @Transactional
    public WishlistDTO createWishlist(UUID userId, CreateWishlistRequest request) {
        log.info("Creating wishlist for user: {}", userId);

        Wishlist wishlist = Wishlist.builder()
                .userId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .build();

        wishlist = wishlistRepository.save(wishlist);

        log.info("Wishlist created: {}", wishlist.getId());
        return toWishlistDTO(wishlist);
    }

    /**
     * Update wishlist.
     */
    @Transactional
    public WishlistDTO updateWishlist(UUID wishlistId, UUID userId, UpdateWishlistRequest request) {
        log.info("Updating wishlist: {} for user: {}", wishlistId, userId);

        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_001));

        if (!wishlist.getUserId().equals(userId)) {
            throw new WishlistException(ErrorCodes.AUTHZ_004);
        }

        if (request.getName() != null) wishlist.setName(request.getName());
        if (request.getDescription() != null) wishlist.setDescription(request.getDescription());
        if (request.getIsPublic() != null) wishlist.setPublic(request.getIsPublic());

        wishlist = wishlistRepository.save(wishlist);

        log.info("Wishlist updated: {}", wishlistId);
        return toWishlistDTO(wishlist);
    }

    /**
     * Delete wishlist.
     */
    @Transactional
    public void deleteWishlist(UUID wishlistId, UUID userId) {
        log.info("Deleting wishlist: {} for user: {}", wishlistId, userId);

        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_001));

        if (!wishlist.getUserId().equals(userId)) {
            throw new WishlistException(ErrorCodes.AUTHZ_004);
        }

        // Delete all items first
        wishlistItemRepository.deleteByWishlistId(wishlistId);
        wishlistRepository.delete(wishlist);

        // Clear cache
        redisService.delete("wishlist:" + wishlistId);

        log.info("Wishlist deleted: {}", wishlistId);
    }

    // ==================== WISHLIST ITEMS ====================

    /**
     * Add item to wishlist.
     */
    @Transactional
    public WishlistItemDTO addItem(UUID wishlistId, UUID userId, AddWishlistItemRequest request) {
        log.info("Adding item to wishlist: {}, product: {}", wishlistId, request.getProductId());

        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_001));

        if (!wishlist.getUserId().equals(userId)) {
            throw new WishlistException(ErrorCodes.AUTHZ_004);
        }

        // Check if product already in wishlist
        if (wishlistItemRepository.existsByWishlistIdAndProductId(wishlistId, request.getProductId())) {
            throw new WishlistException(ErrorCodes.WISH_002);
        }

        // Get product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new WishlistException(ErrorCodes.PROD_001));

        // Create wishlist item
        WishlistItem item = WishlistItem.builder()
                .wishlistId(wishlistId)
                .productId(request.getProductId())
                .targetPrice(request.getTargetPrice())
                .priceAlertEnabled(request.getPriceAlertEnabled() != null ? request.getPriceAlertEnabled() : true)
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .addedAt(Instant.now())
                .build();

        item = wishlistItemRepository.save(item);

        // Update wishlist item count
        wishlist.setItemCount(wishlist.getItemCount() + 1);
        wishlistRepository.save(wishlist);

        log.info("Item added to wishlist: {}", item.getId());
        return toWishlistItemDTO(item, product);
    }

    /**
     * Remove item from wishlist.
     */
    @Transactional
    public void removeItem(UUID wishlistId, UUID itemId, UUID userId) {
        log.info("Removing item: {} from wishlist: {}", itemId, wishlistId);

        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_001));

        if (!wishlist.getUserId().equals(userId)) {
            throw new WishlistException(ErrorCodes.AUTHZ_004);
        }

        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_003));

        wishlistItemRepository.delete(item);

        // Update wishlist item count
        wishlist.setItemCount(Math.max(0, wishlist.getItemCount() - 1));
        wishlistRepository.save(wishlist);

        log.info("Item removed from wishlist: {}", itemId);
    }

    /**
     * Update wishlist item.
     */
    @Transactional
    public WishlistItemDTO updateItem(UUID wishlistId, UUID itemId, UUID userId, UpdateWishlistItemRequest request) {
        log.info("Updating item: {} in wishlist: {}", itemId, wishlistId);

        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_001));

        if (!wishlist.getUserId().equals(userId)) {
            throw new WishlistException(ErrorCodes.AUTHZ_004);
        }

        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_003));

        if (request.getTargetPrice() != null) item.setTargetPrice(request.getTargetPrice());
        if (request.getPriceAlertEnabled() != null) item.setPriceAlertEnabled(request.getPriceAlertEnabled());
        if (request.getQuantity() != null) item.setQuantity(request.getQuantity());

        item = wishlistItemRepository.save(item);

        Product product = productRepository.findById(item.getProductId()).orElse(null);

        log.info("Item updated: {}", itemId);
        return toWishlistItemDTO(item, product);
    }

    /**
     * Move item to cart.
     */
    @Transactional
    public void moveToCart(UUID wishlistId, UUID itemId, UUID userId, Integer quantity) {
        log.info("Moving item: {} to cart from wishlist: {}", itemId, wishlistId);

        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_001));

        if (!wishlist.getUserId().equals(userId)) {
            throw new WishlistException(ErrorCodes.AUTHZ_004);
        }

        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_003));

        // TODO: Add to cart service
        // For now, just delete from wishlist
        wishlistItemRepository.delete(item);

        wishlist.setItemCount(Math.max(0, wishlist.getItemCount() - 1));
        wishlistRepository.save(wishlist);

        log.info("Item moved to cart: {}", itemId);
    }

    /**
     * Share wishlist.
     */
    @Transactional
    public String shareWishlist(UUID wishlistId, UUID userId) {
        log.info("Sharing wishlist: {}", wishlistId);

        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistException(ErrorCodes.WISH_001));

        if (!wishlist.getUserId().equals(userId)) {
            throw new WishlistException(ErrorCodes.AUTHZ_004);
        }

        // Generate share URL
        String shareUrl = "https://pricebrain.com/wishlist/" + wishlistId;
        wishlist.setShareUrl(shareUrl);
        wishlist.setPublic(true);
        wishlistRepository.save(wishlist);

        return shareUrl;
    }

    // ==================== HELPERS ====================

    /**
     * Convert Wishlist to DTO.
     */
    private WishlistDTO toWishlistDTO(Wishlist wishlist) {
        List<WishlistItem> items = wishlistItemRepository.findByWishlistId(wishlist.getId());

        return WishlistDTO.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUserId())
                .name(wishlist.getName())
                .description(wishlist.getDescription())
                .isPublic(wishlist.getIsPublic())
                .shareUrl(wishlist.getShareUrl())
                .itemCount(wishlist.getItemCount())
                .alertEnabledItems((int) items.stream().filter(WishlistItem::getPriceAlertEnabled).count())
                .items(items.stream().map(item -> {
                    Product product = productRepository.findById(item.getProductId()).orElse(null);
                    return toWishlistItemDTO(item, product);
                }).toList())
                .createdAt(wishlist.getCreatedAt())
                .updatedAt(wishlist.getUpdatedAt())
                .build();
    }

    /**
     * Convert WishlistItem to DTO.
     */
    private WishlistItemDTO toWishlistItemDTO(WishlistItem item, Product product) {
        WishlistItemDTO.WishlistItemDTOBuilder builder = WishlistItemDTO.builder()
                .id(item.getId())
                .wishlistId(item.getWishlistId())
                .productId(item.getProductId())
                .targetPrice(item.getTargetPrice())
                .priceAlertEnabled(item.getPriceAlertEnabled())
                .quantity(item.getQuantity())
                .addedAt(item.getAddedAt());

        if (product != null) {
            builder.productName(product.getName())
                    .productImage(product.getImages() != null && !product.getImages().isEmpty() ? product.getImages().get(0) : null)
                    .price(product.getPrice())
                    .originalPrice(product.getOriginalPrice())
                    .discountPercent(calculateDiscount(product.getPrice(), product.getOriginalPrice()))
                    .inStock(product.getStockQuantity() > 0);
        }

        return builder.build();
    }

    /**
     * Calculate discount percentage.
     */
    private Double calculateDiscount(Double price, Double originalPrice) {
        if (originalPrice == null || originalPrice <= 0 || price >= originalPrice) {
            return 0.0;
        }
        return Math.round((1 - price / originalPrice) * 100 * 100.0) / 100.0;
    }

    /**
     * Custom wishlist exception.
     */
    public static class WishlistException extends RuntimeException {
        private final ErrorCodes errorCode;

        public WishlistException(ErrorCodes errorCode) {
            super(errorCode.getDefaultMessage());
            this.errorCode = errorCode;
        }

        public ErrorCodes getErrorCode() {
            return errorCode;
        }
    }
}
