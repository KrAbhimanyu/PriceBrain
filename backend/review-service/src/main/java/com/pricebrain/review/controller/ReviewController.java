package com.pricebrain.review.controller;

import com.pricebrain.review.dto.ReviewDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import com.pricebrain.review.service.ReviewService;
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
 * Review API endpoints for product reviews and ratings.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Product Review APIs")
public class ReviewController extends BaseController {

    private final ReviewService reviewService;

    @Operation(summary = "Get product reviews")
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<ReviewListDTO>> getProductReviews(
            @PathVariable UUID productId,
            @Parameter(description = "Sort by")
            @RequestParam(defaultValue = "recent") String sortBy,
            @Parameter(description = "Filter by rating")
            @RequestParam(required = false) Integer rating,
            @Parameter(description = "Page")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Size")
            @RequestParam(defaultValue = "10") int size) {

        log.info("Get reviews for product: {}", productId);
        ReviewListDTO reviews = reviewService.getProductReviews(productId, sortBy, rating, page, size);
        return success(reviews);
    }

    @Operation(summary = "Get review by ID")
    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewDTO>> getReview(@PathVariable UUID reviewId) {
        log.info("Get review: {}", reviewId);
        ReviewDTO review = reviewService.getReview(reviewId);
        return success(review);
    }

    @Operation(summary = "Create review")
    @PostMapping
    @ApiResponses({
            @SwgResponse(responseCode = "201", description = "Review created"),
            @SwgResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<ApiResponse<ReviewDTO>> createReview(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody CreateReviewRequest request) {

        log.info("Create review for user: {}, product: {}", userId, request.getProductId());
        ReviewDTO review = reviewService.createReview(userId, request);
        return created(review, "Review created successfully");
    }

    @Operation(summary = "Update review")
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewDTO>> updateReview(
            @PathVariable UUID reviewId,
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody UpdateReviewRequest request) {

        log.info("Update review: {} for user: {}", reviewId, userId);
        ReviewDTO review = reviewService.updateReview(reviewId, userId, request);
        return success(review, "Review updated successfully");
    }

    @Operation(summary = "Delete review")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable UUID reviewId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Delete review: {} for user: {}", reviewId, userId);
        reviewService.deleteReview(reviewId, userId);
        return success("Review deleted successfully");
    }

    @Operation(summary = "Vote review helpful")
    @PostMapping("/{reviewId}/vote")
    public ResponseEntity<ApiResponse<Void>> voteHelpful(
            @PathVariable UUID reviewId,
            @RequestParam(defaultValue = "helpful") String type) {

        log.info("Vote review: {} as {}", reviewId, type);
        reviewService.voteReview(reviewId, type);
        return success("Vote recorded");
    }

    @Operation(summary = "Report review")
    @PostMapping("/{reviewId}/report")
    public ResponseEntity<ApiResponse<Void>> reportReview(
            @PathVariable UUID reviewId,
            @RequestHeader("X-User-ID") UUID userId,
            @RequestBody ReportReviewRequest request) {

        log.info("Report review: {} by user: {}", reviewId, userId);
        reviewService.reportReview(reviewId, userId, request.getReason());
        return success("Review reported");
    }

    @Operation(summary = "Get user's reviews")
    @GetMapping("/user/me")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getMyReviews(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get reviews for user: {}", userId);
        List<ReviewDTO> reviews = reviewService.getUserReviews(userId);
        return success(reviews);
    }

    @Operation(summary = "Get product rating summary")
    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<ApiResponse<RatingSummaryDTO>> getRatingSummary(
            @PathVariable UUID productId) {

        log.info("Get rating summary for product: {}", productId);
        RatingSummaryDTO summary = reviewService.getRatingSummary(productId);
        return success(summary);
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Review list response")
    public static class ReviewListDTO {
        private List<ReviewDTO> reviews;
        private int page;
        private int size;
        private long totalElements;
        private RatingSummaryDTO summary;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Review details")
    public static class ReviewDTO {
        private UUID id;
        private UUID productId;
        private UUID userId;
        private String userName;
        private String userImage;
        private Integer rating;
        private String title;
        private String content;
        private List<String> images;
        private Integer helpfulVotes;
        private Integer notHelpfulVotes;
        private Boolean isVerifiedPurchase;
        private Boolean isEdited;
        private String sellerResponse;
        private String sellerResponseDate;
        private java.time.Instant createdAt;
        private java.time.Instant updatedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Create review request")
    public static class CreateReviewRequest {
        @Schema(description = "Product ID")
        private UUID productId;
        
        @Schema(description = "Rating (1-5)")
        private Integer rating;
        
        private String title;
        private String content;
        private List<String> images;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update review request")
    public static class UpdateReviewRequest {
        private Integer rating;
        private String title;
        private String content;
        private List<String> images;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Rating summary")
    public static class RatingSummaryDTO {
        private UUID productId;
        private Double averageRating;
        private Integer totalReviews;
        private Integer rating1Count;
        private Integer rating2Count;
        private Integer rating3Count;
        private Integer rating4Count;
        private Integer rating5Count;
        private Integer verifiedReviews;
        private Integer withImages;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Report review request")
    public static class ReportReviewRequest {
        private String reason;
    }
}
