package com.pricebrain.wishlist.repository;

import com.pricebrain.shared.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * WishlistItem repository.
 */
@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, UUID> {

    /**
     * Find all items by wishlist ID.
     */
    List<WishlistItem> findByWishlistId(UUID wishlistId);

    /**
     * Find item by wishlist ID and product ID.
     */
    Optional<WishlistItem> findByWishlistIdAndProductId(UUID wishlistId, UUID productId);

    /**
     * Check if item exists in wishlist.
     */
    boolean existsByWishlistIdAndProductId(UUID wishlistId, UUID productId);

    /**
     * Delete all items by wishlist ID.
     */
    void deleteByWishlistId(UUID wishlistId);

    /**
     * Count items by wishlist ID.
     */
    long countByWishlistId(UUID wishlistId);

    /**
     * Find items with price alerts enabled.
     */
    List<WishlistItem> findByPriceAlertEnabledTrue();
}
