package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Cart entity representing a user's shopping cart.
 */
@Entity
@Table(name = "carts", indexes = {
    @Index(name = "idx_carts_user", columnList = "user_id"),
    @Index(name = "idx_carts_session", columnList = "session_id")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Cart extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "is_guest")
    @Builder.Default
    private Boolean isGuest = false;

    @Column(name = "subtotal", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "coupon_id")
    private UUID couponId;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_suggestions", columnDefinition = "jsonb")
    private String aiSuggestions;

    @Column(name = "expires_at")
    private Instant expiresAt;
}
