package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * OrderItem entity representing individual items in an order.
 */
@Entity
@Table(name = "order_items", indexes = {
    @Index(name = "idx_order_items_order", columnList = "order_id"),
    @Index(name = "idx_order_items_product", columnList = "product_id"),
    @Index(name = "idx_order_items_seller", columnList = "seller_id")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem extends BaseEntity {

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @Column(name = "variant_id")
    private UUID variantId;

    @Column(name = "seller_id")
    private UUID sellerId;

    @Column(name = "sku", length = 100)
    private String sku;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "variant_name", length = 255)
    private String variantName;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "taxable_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxableAmount;

    @Column(name = "tax_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxPercent = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "seller_commission", precision = 10, scale = 2)
    private BigDecimal sellerCommission;

    @Column(name = "seller_payout", precision = 10, scale = 2)
    private BigDecimal sellerPayout;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_status", length = 20)
    @Builder.Default
    private ItemStatus itemStatus = ItemStatus.CONFIRMED;

    public enum ItemStatus {
        CONFIRMED,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED,
        RETURNED,
        REFUNDED
    }
}
