package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

/**
 * Stock movement entity for tracking inventory changes.
 */
@Entity
@Table(name = "stock_movements", indexes = {
    @Index(name = "idx_movement_product", columnList = "product_id"),
    @Index(name = "idx_movement_type", columnList = "type"),
    @Index(name = "idx_movement_created", columnList = "created_at")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement extends BaseEntity {

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private String type; // RESTOCK, RESERVE, RELEASE, DEDUCT, ADJUSTMENT

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "balance_before")
    private Integer balanceBefore;

    @Column(name = "balance_after")
    private Integer balanceAfter;

    @Column(name = "reason")
    private String reason;

    @Column(name = "reference")
    private String reference; // Order ID, Supplier ID, etc.

    @Column(name = "performed_by")
    private UUID performedBy;
}
