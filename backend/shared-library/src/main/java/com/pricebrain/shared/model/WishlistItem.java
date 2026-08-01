package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * WishlistItem entity representing items in a wishlist.
 */
@Entity
@Table(name = "wishlist_items", indexes = {
    @Index(name = "idx_wishlist_items_wishlist", columnList = "wishlist_id"),
    @Index(name = "idx_wishlist_items_product", columnList = "product_id")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItem extends BaseEntity {

    @Column(name = "wishlist_id", nullable = false)
    private UUID wishlistId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wishlist_id", insertable = false, updatable = false)
    private Wishlist wishlist;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @Column(name = "target_price", precision = 10, scale = 2)
    private BigDecimal targetPrice;

    @Column(name = "price_alert_enabled")
    @Builder.Default
    private Boolean priceAlertEnabled = true;

    @Column(name = "notify_on_discount")
    @Builder.Default
    private Boolean notifyOnDiscount = true;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
