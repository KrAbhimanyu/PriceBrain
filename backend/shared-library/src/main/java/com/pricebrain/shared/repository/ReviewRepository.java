package com.pricebrain.shared.repository;

import com.pricebrain.shared.model.Review;
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
 * Repository for Review entity operations.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID>, JpaSpecificationExecutor<Review> {

    /**
     * Find reviews by product.
     */
    Page<Review> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    /**
     * Find approved reviews by product.
     */
    Page<Review> findByProductIdAndStatusOrderByCreatedAtDesc(UUID productId, Review.ReviewStatus status, Pageable pageable);

    /**
     * Find reviews by user.
     */
    Page<Review> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /**
     * Check if user reviewed product.
     */
    boolean existsByUserIdAndProductId(UUID userId, UUID productId);

    /**
     * Find user's review for product.
     */
    Optional<Review> findByUserIdAndProductId(UUID userId, UUID productId);

    /**
     * Find reviews by rating.
     */
    List<Review> findByProductIdAndRating(UUID productId, int rating);

    /**
     * Calculate average rating for product.
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.productId = :productId AND r.status = 'APPROVED'")
    BigDecimal calculateAverageRating(@Param("productId") UUID productId);

    /**
     * Count reviews by rating for product.
     */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.productId = :productId AND r.status = 'APPROVED' GROUP BY r.rating")
    List<Object[]> countByRatingForProduct(@Param("productId") UUID productId);

    /**
     * Count reviews by product.
     */
    long countByProductIdAndStatus(UUID productId, Review.ReviewStatus status);

    /**
     * Find pending moderation reviews.
     */
    Page<Review> findByStatus(Review.ReviewStatus status, Pageable pageable);

    /**
     * Increment helpful count.
     */
    @Modifying
    @Query("UPDATE Review r SET r.helpfulCount = r.helpfulCount + 1 WHERE r.id = :reviewId")
    void incrementHelpfulCount(@Param("reviewId") UUID reviewId);

    /**
     * Increment report count.
     */
    @Modifying
    @Query("UPDATE Review r SET r.reportCount = r.reportCount + 1 WHERE r.id = :reviewId")
    void incrementReportCount(@Param("reviewId") UUID reviewId);

    /**
     * Find recent reviews.
     */
    @Query("SELECT r FROM Review r WHERE r.status = 'APPROVED' ORDER BY r.createdAt DESC")
    List<Review> findRecentReviews(Pageable pageable);

    /**
     * Find reviews with AI sentiment.
     */
    List<Review> findByAiSentimentIsNotNull();

    /**
     * Find flagged reviews.
     */
    List<Review> findByReportCountGreaterThan(int threshold);

    /**
     * Get top reviewers.
     */
    @Query("SELECT r.userId, COUNT(r) as cnt FROM Review r WHERE r.status = 'APPROVED' GROUP BY r.userId ORDER BY cnt DESC")
    List<Object[]> findTopReviewers(Pageable pageable);
}
