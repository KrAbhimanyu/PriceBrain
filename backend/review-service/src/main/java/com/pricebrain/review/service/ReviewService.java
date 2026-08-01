package com.pricebrain.review.service;

import com.pricebrain.review.controller.ReviewController.*;
import com.pricebrain.review.repository.ReviewRepository;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.document.ReviewDocument;
import com.pricebrain.shared.repository.ProductRepository;
import com.pricebrain.shared.repository.UserRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Review service implementing business logic for product reviews.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final MongoTemplate mongoTemplate;
    private final RedisService redisService;
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // ==================== REVIEWS ====================

    /**
     * Get product reviews with pagination.
     */
    public ReviewListDTO getProductReviews(UUID productId, String sortBy, Integer rating, int page, int size) {
        log.info("Getting reviews for product: {}, sortBy: {}, rating: {}", productId, sortBy, rating);

        Query query = new Query();
        query.addCriteria(Criteria.where("productId").is(productId));
        if (rating != null) {
            query.addCriteria(Criteria.where("rating").is(rating));
        }

        // Sort
        switch (sortBy) {
            case "helpful" -> query.with(PageRequest.of(page, size, org.springframework.data.domain.Sort.by("helpfulVotes").descending()));
            case "rating_high" -> query.with(PageRequest.of(page, size, org.springframework.data.domain.Sort.by("rating").descending()));
            case "rating_low" -> query.with(PageRequest.of(page, size, org.springframework.data.domain.Sort.by("rating").ascending()));
            default -> query.with(PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending()));
        }

        List<ReviewDocument> reviews = mongoTemplate.find(query, ReviewDocument.class);
        long total = mongoTemplate.count(query, ReviewDocument.class);

        // Get rating summary
        RatingSummaryDTO summary = getRatingSummary(productId);

        return ReviewListDTO.builder()
                .reviews(reviews.stream().map(this::toDTO).toList())
                .page(page)
                .size(size)
                .totalElements(total)
                .summary(summary)
                .build();
    }

    /**
     * Get review by ID.
     */
    public ReviewDTO getReview(UUID reviewId) {
        log.info("Getting review: {}", reviewId);

        ReviewDocument review = mongoTemplate.findById(reviewId, ReviewDocument.class);
        if (review == null) {
            throw new ReviewException(ErrorCodes.REVIEW_001);
        }

        return toDTO(review);
    }

    /**
     * Create new review.
     */
    public ReviewDTO createReview(UUID userId, CreateReviewRequest request) {
        log.info("Creating review for user: {}, product: {}", userId, request.getProductId());

        // Check if user already reviewed this product
        Query existingQuery = Query.query(
                Criteria.where("productId").is(request.getProductId())
                        .and("userId").is(userId)
        );
        if (mongoTemplate.exists(existingQuery, ReviewDocument.class)) {
            throw new ReviewException(ErrorCodes.REVIEW_002);
        }

        // Create review
        ReviewDocument review = ReviewDocument.builder()
                .productId(request.getProductId())
                .userId(userId)
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .images(request.getImages())
                .helpfulVotes(0)
                .notHelpfulVotes(0)
                .isVerifiedPurchase(true) // TODO: Check order
                .isEdited(false)
                .status("APPROVED") // TODO: Add moderation
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        review = mongoTemplate.save(review);

        // Update product rating
        updateProductRating(request.getProductId());

        // Clear cache
        redisService.delete("product:reviews:" + request.getProductId());

        log.info("Review created: {}", review.getId());
        return toDTO(review);
    }

    /**
     * Update existing review.
     */
    public ReviewDTO updateReview(UUID reviewId, UUID userId, UpdateReviewRequest request) {
        log.info("Updating review: {} for user: {}", reviewId, userId);

        ReviewDocument review = mongoTemplate.findById(reviewId, ReviewDocument.class);
        if (review == null) {
            throw new ReviewException(ErrorCodes.REVIEW_001);
        }

        // Verify ownership
        if (!review.getUserId().equals(userId)) {
            throw new ReviewException(ErrorCodes.AUTHZ_004);
        }

        // Update fields
        if (request.getRating() != null) review.setRating(request.getRating());
        if (request.getTitle() != null) review.setTitle(request.getTitle());
        if (request.getContent() != null) review.setContent(request.getContent());
        if (request.getImages() != null) review.setImages(request.getImages());
        review.setEdited(true);
        review.setUpdatedAt(Instant.now());

        review = mongoTemplate.save(review);

        // Update product rating
        updateProductRating(review.getProductId());

        // Clear cache
        redisService.delete("product:reviews:" + review.getProductId());

        log.info("Review updated: {}", reviewId);
        return toDTO(review);
    }

    /**
     * Delete review.
     */
    public void deleteReview(UUID reviewId, UUID userId) {
        log.info("Deleting review: {} for user: {}", reviewId, userId);

        ReviewDocument review = mongoTemplate.findById(reviewId, ReviewDocument.class);
        if (review == null) {
            throw new ReviewException(ErrorCodes.REVIEW_001);
        }

        // Verify ownership
        if (!review.getUserId().equals(userId)) {
            throw new ReviewException(ErrorCodes.AUTHZ_004);
        }

        UUID productId = review.getProductId();
        mongoTemplate.remove(review);

        // Update product rating
        updateProductRating(productId);

        // Clear cache
        redisService.delete("product:reviews:" + productId);

        log.info("Review deleted: {}", reviewId);
    }

    /**
     * Vote review as helpful/not helpful.
     */
    public void voteReview(UUID reviewId, String type) {
        log.info("Voting review: {} as {}", reviewId, type);

        Query query = Query.query(Criteria.where("id").is(reviewId));
        Update update = new Update();
        if ("helpful".equals(type)) {
            update.inc("helpfulVotes", 1);
        } else {
            update.inc("notHelpfulVotes", 1);
        }

        mongoTemplate.updateFirst(query, update, ReviewDocument.class);
    }

    /**
     * Report review.
     */
    public void reportReview(UUID reviewId, UUID userId, String reason) {
        log.info("Reporting review: {} by user: {}, reason: {}", reviewId, userId, reason);

        // Update review status
        Query query = Query.query(Criteria.where("id").is(reviewId));
        Update update = new Update().set("status", "REPORTED");
        mongoTemplate.updateFirst(query, update, ReviewDocument.class);

        // TODO: Create report record
        log.info("Review {} reported", reviewId);
    }

    /**
     * Get user's reviews.
     */
    public List<ReviewDTO> getUserReviews(UUID userId) {
        log.info("Getting reviews for user: {}", userId);

        Query query = Query.query(Criteria.where("userId").is(userId));
        query.with(org.springframework.data.domain.Sort.by("createdAt").descending());

        List<ReviewDocument> reviews = mongoTemplate.find(query, ReviewDocument.class);
        return reviews.stream().map(this::toDTO).toList();
    }

    /**
     * Get rating summary for product.
     */
    public RatingSummaryDTO getRatingSummary(UUID productId) {
        log.info("Getting rating summary for product: {}", productId);

        // Try cache
        String cacheKey = "product:rating:" + productId;
        RatingSummaryDTO cached = (RatingSummaryDTO) redisService.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // Aggregate ratings
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("productId").is(productId).and("status").is("APPROVED")),
                Aggregation.group("productId")
                        .avg("rating").as("averageRating")
                        .count().as("totalReviews")
                        .sum(ConditionalOperators.when(Criteria.where("rating").is(1)).then(1).otherwise(0)).as("rating1Count")
                        .sum(ConditionalOperators.when(Criteria.where("rating").is(2)).then(1).otherwise(0)).as("rating2Count")
                        .sum(ConditionalOperators.when(Criteria.where("rating").is(3)).then(1).otherwise(0)).as("rating3Count")
                        .sum(ConditionalOperators.when(Criteria.where("rating").is(4)).then(1).otherwise(0)).as("rating4Count")
                        .sum(ConditionalOperators.when(Criteria.where("rating").is(5)).then(1).otherwise(0)).as("rating5Count")
        );

        // Simple count-based approach
        List<ReviewDocument> allReviews = mongoTemplate.find(
                Query.query(Criteria.where("productId").is(productId).and("status").is("APPROVED")),
                ReviewDocument.class
        );

        int total = allReviews.size();
        double avgRating = total > 0 ? allReviews.stream().mapToInt(ReviewDocument::getRating).average().orElse(0) : 0;

        RatingSummaryDTO summary = RatingSummaryDTO.builder()
                .productId(productId)
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .totalReviews(total)
                .rating1Count((int) allReviews.stream().filter(r -> r.getRating() == 1).count())
                .rating2Count((int) allReviews.stream().filter(r -> r.getRating() == 2).count())
                .rating3Count((int) allReviews.stream().filter(r -> r.getRating() == 3).count())
                .rating4Count((int) allReviews.stream().filter(r -> r.getRating() == 4).count())
                .rating5Count((int) allReviews.stream().filter(r -> r.getRating() == 5).count())
                .verifiedReviews((int) allReviews.stream().filter(r -> Boolean.TRUE.equals(r.getIsVerifiedPurchase())).count())
                .withImages((int) allReviews.stream().filter(r -> r.getImages() != null && !r.getImages().isEmpty()).count())
                .build();

        // Cache for 5 minutes
        redisService.set(cacheKey, summary, 300);

        return summary;
    }

    // ==================== HELPERS ====================

    /**
     * Update product's average rating.
     */
    private void updateProductRating(UUID productId) {
        log.info("Updating rating for product: {}", productId);

        List<ReviewDocument> reviews = mongoTemplate.find(
                Query.query(Criteria.where("productId").is(productId).and("status").is("APPROVED")),
                ReviewDocument.class
        );

        if (reviews.isEmpty()) {
            return;
        }

        double avgRating = reviews.stream().mapToInt(ReviewDocument::getRating).average().orElse(0);
        int reviewCount = reviews.size();

        // Update in PostgreSQL (via product repository)
        productRepository.findById(productId).ifPresent(product -> {
            product.setAverageRating(avgRating);
            product.setReviewCount(reviewCount);
            productRepository.save(product);
        });

        // Clear cache
        redisService.delete("product:rating:" + productId);
    }

    /**
     * Convert ReviewDocument to DTO.
     */
    private ReviewDTO toDTO(ReviewDocument review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .userName("User") // TODO: Get from user service
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .images(review.getImages())
                .helpfulVotes(review.getHelpfulVotes())
                .notHelpfulVotes(review.getNotHelpfulVotes())
                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                .isEdited(review.getIsEdited())
                .sellerResponse(review.getSellerResponse())
                .sellerResponseDate(review.getSellerResponseDate() != null ? review.getSellerResponseDate().toString() : null)
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    /**
     * Custom review exception.
     */
    public static class ReviewException extends RuntimeException {
        private final ErrorCodes errorCode;

        public ReviewException(ErrorCodes errorCode) {
            super(errorCode.getDefaultMessage());
            this.errorCode = errorCode;
        }

        public ErrorCodes getErrorCode() {
            return errorCode;
        }
    }
}
