package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

/**
 * Inventory entity for stock management.
 */
@Entity
@Table(name = "inventory", indexes = {
    @Index(name = "idx_inventory_product", columnList = "product_id"),
    @Index(name = "idx_inventory_low_stock", columnList = "available_stock")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory extends BaseEntity {

    @Column(name = "product_id", nullable = false, unique = true)
    private UUID productId;

    @Column(name = "available_stock", nullable = false)
    @Builder.Default
    private Integer availableStock = 0;

    @Column(name = "reserved_stock", nullable = false)
    @Builder.Default
    private Integer reservedStock = 0;

    @Column(name = "total_stock", nullable = false)
    @Builder.Default
    private Integer totalStock = 0;

    @Column(name = "low_stock_threshold")
    @Builder.Default
    private Integer lowStockThreshold = 10;

    @Column(name = "reorder_level")
    @Builder.Default
    private Integer reorderLevel = 20;

    @Column(name = "last_restocked_at")
    private Instant lastRestockedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status", nullable = false)
    @Builder.Default
    private StockStatus stockStatus = StockStatus.IN_STOCK;

    /**
     * Calculate stock status based on available stock.
     */
    @PrePersist
    @PreUpdate
    public void updateStockStatus() {
        if (availableStock <= 0) {
            stockStatus = StockStatus.OUT_OF_STOCK;
        } else if (availableStock <= lowStockThreshold) {
            stockStatus = StockStatus.LOW_STOCK;
        } else {
            stockStatus = StockStatus.IN_STOCK;
        }
    }

    /**
     * Stock status enum.
     */
    public enum StockStatus {
        IN_STOCK,
        LOW_STOCK,
        OUT_OF_STOCK
    }
}
