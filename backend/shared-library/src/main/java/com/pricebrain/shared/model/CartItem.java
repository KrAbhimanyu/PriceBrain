package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * CartItem entity representing items in a shopping cart.
 */
@Entity
@Table(name = "cart_items", indexes = {
    @Index(name = "idx_cart_items_cart", columnList = "cart_id"),
    @Index(name = "idx_cart_items_product", columnList = "product_id")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem extends BaseEntity {

    @Column(name = "cart_id", nullable = false)
    private UUID cartId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", insertable = false, updatable = false)
    private Cart cart;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @Column(name = "variant_id")
    private UUID variantId;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "is_saved")
    @Builder.Default
    private Boolean isSaved = false;

    @Column(name = "ai_recommended")
    @Builder.Default
    private Boolean aiRecommended = false;

    @Column(name = "added_at")
    @Builder.Default
    private Instant addedAt = Instant.now();
}
