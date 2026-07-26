package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Wishlist entity representing user's wishlists.
 */
@Entity
@Table(name = "wishlists", indexes = {
    @Index(name = "idx_wishlists_user", columnList = "user_id"),
    @Index(name = "idx_wishlists_share", columnList = "share_token")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Wishlist extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "name", length = 100)
    @Builder.Default
    private String name = "My Wishlist";

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = false;

    @Column(name = "share_token", unique = true, length = 100)
    private String shareToken;
}
