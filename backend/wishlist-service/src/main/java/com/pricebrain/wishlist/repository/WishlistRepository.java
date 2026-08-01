package com.pricebrain.wishlist.repository;

import com.pricebrain.shared.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Wishlist repository.
 */
@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {

    /**
     * Find all wishlists by user ID.
     */
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Find wishlist by ID and user ID.
     */
    Optional<Wishlist> findByIdAndUserId(UUID wishlistId, UUID userId);

    /**
     * Check if wishlist exists for user.
     */
    boolean existsByIdAndUserId(UUID wishlistId, UUID userId);

    /**
     * Delete all wishlists by user ID.
     */
    void deleteByUserId(UUID userId);

    /**
     * Count wishlists by user ID.
     */
    long countByUserId(UUID userId);
}
