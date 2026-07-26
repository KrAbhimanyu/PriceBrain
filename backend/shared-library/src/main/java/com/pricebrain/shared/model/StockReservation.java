package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

/**
 * Stock reservation entity for order processing.
 */
@Entity
@Table(name = "stock_reservations", indexes = {
    @Index(name = "idx_reservation_id", columnList = "reservation_id"),
    @Index(name = "idx_reservation_product", columnList = "product_id"),
    @Index(name = "idx_reservation_order", columnList = "order_id"),
    @Index(name = "idx_reservation_status", columnList = "status, expires_at")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class StockReservation extends BaseEntity {

    @Column(name = "reservation_id", nullable = false, unique = true)
    private String reservationId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "RESERVED"; // RESERVED, RELEASED, CONFIRMED, EXPIRED

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "released_at")
    private Instant releasedAt;

    /**
     * Check if reservation is expired.
     */
    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
