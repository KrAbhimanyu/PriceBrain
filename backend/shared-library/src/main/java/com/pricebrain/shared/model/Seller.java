package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Seller entity representing sellers/stores in the platform.
 */
@Entity
@Table(name = "sellers", indexes = {
    @Index(name = "idx_sellers_user", columnList = "user_id"),
    @Index(name = "idx_sellers_slug", columnList = "store_slug"),
    @Index(name = "idx_sellers_status", columnList = "status")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Seller extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "store_name", nullable = false, length = 200)
    private String storeName;

    @Column(name = "store_slug", nullable = false, unique = true, length = 200)
    private String storeSlug;

    @Column(name = "store_description", columnDefinition = "TEXT")
    private String storeDescription;

    @Column(name = "store_logo_url", length = 500)
    private String storeLogoUrl;

    @Column(name = "store_banner_url", length = 500)
    private String storeBannerUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SellerStatus status = SellerStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "seller_type", length = 20)
    @Builder.Default
    private SellerType sellerType = SellerType.INDIVIDUAL;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "total_products")
    @Builder.Default
    private Integer totalProducts = 0;

    @Column(name = "total_orders")
    @Builder.Default
    private Integer totalOrders = 0;

    @Column(name = "total_revenue", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "ai_business_score")
    private Integer aiBusinessScore;

    public enum SellerStatus {
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        SUSPENDED,
        REJECTED
    }

    public enum SellerType {
        INDIVIDUAL,
        BUSINESS,
        ENTERPRISE
    }
}
