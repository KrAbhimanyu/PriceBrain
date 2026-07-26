package com.pricebrain.shared.repository;

import com.pricebrain.shared.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Product entity operations.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    /**
     * Find product by slug.
     */
    Optional<Product> findBySlug(String slug);

    /**
     * Check if slug exists.
     */
    boolean existsBySlug(String slug);

    /**
     * Find products by seller.
     */
    Page<Product> findBySellerId(UUID sellerId, Pageable pageable);

    /**
     * Find products by seller and status.
     */
    Page<Product> findBySellerIdAndStatus(UUID sellerId, Product.ProductStatus status, Pageable pageable);

    /**
     * Find products by brand.
     */
    Page<Product> findByBrandId(UUID brandId, Pageable pageable);

    /**
     * Find products by category.
     */
    Page<Product> findByCategoryId(UUID categoryId, Pageable pageable);

    /**
     * Find featured products.
     */
    List<Product> findByIsFeaturedTrueAndStatus(Product.ProductStatus status);

    /**
     * Find bestsellers.
     */
    List<Product> findByIsBestsellerTrueAndStatus(Product.ProductStatus status);

    /**
     * Find products by status.
     */
    Page<Product> findByStatus(Product.ProductStatus status, Pageable pageable);

    /**
     * Find approved products.
     */
    List<Product> findByStatusOrderByViewCountDesc(Product.ProductStatus status, Pageable pageable);

    /**
     * Search products by name or description.
     */
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    /**
     * Find products in price range.
     */
    @Query("SELECT p FROM Product p WHERE p.status = 'APPROVED' AND " +
           "p.sellingPrice BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceRange(
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    /**
     * Find low stock products.
     */
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.lowStockThreshold AND p.stockQuantity > 0")
    Page<Product> findLowStockProducts(Pageable pageable);

    /**
     * Find out of stock products.
     */
    List<Product> findByStockQuantityLessThanEqualAndStockQuantityGreaterThan(0, 0);

    /**
     * Increment view count.
     */
    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :productId")
    void incrementViewCount(@Param("productId") UUID productId);

    /**
     * Increment wishlist count.
     */
    @Modifying
    @Query("UPDATE Product p SET p.wishlistCount = p.wishlistCount + :delta WHERE p.id = :productId")
    void updateWishlistCount(@Param("productId") UUID productId, @Param("delta") int delta);

    /**
     * Increment order count.
     */
    @Modifying
    @Query("UPDATE Product p SET p.orderCount = p.orderCount + :quantity WHERE p.id = :productId")
    void incrementOrderCount(@Param("productId") UUID productId, @Param("quantity") int quantity);

    /**
     * Update stock quantity.
     */
    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.id = :productId")
    void decrementStock(@Param("productId") UUID productId, @Param("quantity") int quantity);

    /**
     * Update AI quality score.
     */
    @Modifying
    @Query("UPDATE Product p SET p.aiQualityScore = :score WHERE p.id = :productId")
    void updateAIQualityScore(@Param("productId") UUID productId, @Param("score") int score);

    /**
     * Count products by seller.
     */
    long countBySellerIdAndStatus(UUID sellerId, Product.ProductStatus status);

    /**
     * Find products pending moderation.
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.status = 'PENDING'")
    long countPendingModeration();

    /**
     * Find recently added products.
     */
    @Query("SELECT p FROM Product p WHERE p.status = 'APPROVED' ORDER BY p.createdAt DESC")
    List<Product> findRecentlyAdded(Pageable pageable);

    /**
     * Get top rated products.
     */
    @Query("SELECT p FROM Product p WHERE p.status = 'APPROVED' AND p.rating IS NOT NULL ORDER BY p.rating DESC")
    List<Product> findTopRated(Pageable pageable);
}
