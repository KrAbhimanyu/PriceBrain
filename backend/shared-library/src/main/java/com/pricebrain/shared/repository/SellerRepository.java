package com.pricebrain.shared.repository;

import com.pricebrain.shared.model.Seller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Seller entity operations.
 */
@Repository
public interface SellerRepository extends JpaRepository<Seller, UUID> {

    /**
     * Find seller by user ID.
     */
    Optional<Seller> findByUserId(UUID userId);

    /**
     * Find seller by store slug.
     */
    Optional<Seller> findByStoreSlug(String storeSlug);

    /**
     * Check if store slug exists.
     */
    boolean existsByStoreSlug(String storeSlug);

    /**
     * Check if user already has a seller account.
     */
    boolean existsByUserId(UUID userId);

    /**
     * Find sellers by status.
     */
    List<Seller> findByStatus(Seller.SellerStatus status);

    /**
     * Find sellers by status with pagination.
     */
    Page<Seller> findByStatus(Seller.SellerStatus status, Pageable pageable);

    /**
     * Find approved sellers.
     */
    List<Seller> findByStatusOrderByTotalRevenueDesc(Seller.SellerStatus status);

    /**
     * Find top sellers by revenue.
     */
    @Query("SELECT s FROM Seller s WHERE s.status = 'APPROVED' ORDER BY s.totalRevenue DESC")
    List<Seller> findTopSellersByRevenue(Pageable pageable);

    /**
     * Find top sellers by rating.
     */
    @Query("SELECT s FROM Seller s WHERE s.status = 'APPROVED' AND s.rating IS NOT NULL ORDER BY s.rating DESC")
    List<Seller> findTopSellersByRating(Pageable pageable);

    /**
     * Increment seller total orders.
     */
    @Modifying
    @Query("UPDATE Seller s SET s.totalOrders = s.totalOrders + 1 WHERE s.id = :sellerId")
    void incrementTotalOrders(@Param("sellerId") UUID sellerId);

    /**
     * Update seller revenue.
     */
    @Modifying
    @Query("UPDATE Seller s SET s.totalRevenue = s.totalRevenue + :amount WHERE s.id = :sellerId")
    void updateRevenue(@Param("sellerId") UUID sellerId, @Param("amount") BigDecimal amount);

    /**
     * Update seller product count.
     */
    @Modifying
    @Query("UPDATE Seller s SET s.totalProducts = s.totalProducts + :delta WHERE s.id = :sellerId")
    void updateProductCount(@Param("sellerId") UUID sellerId, @Param("delta") int delta);

    /**
     * Update seller rating.
     */
    @Modifying
    @Query("UPDATE Seller s SET s.rating = :rating, s.reviewCount = :reviewCount WHERE s.id = :sellerId")
    void updateRating(@Param("sellerId") UUID sellerId, @Param("rating") BigDecimal rating, @Param("reviewCount") int reviewCount);

    /**
     * Find sellers pending verification.
     */
    @Query("SELECT COUNT(s) FROM Seller s WHERE s.status = 'PENDING'")
    long countPendingVerification();

    /**
     * Search sellers by store name.
     */
    @Query("SELECT s FROM Seller s WHERE LOWER(s.storeName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Seller> searchSellers(@Param("query") String query, Pageable pageable);
}
