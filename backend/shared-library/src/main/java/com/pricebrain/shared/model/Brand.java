package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Brand entity for product branding.
 */
@Entity
@Table(name = "brands", indexes = {
    @Index(name = "idx_brands_slug", columnList = "slug"),
    @Index(name = "idx_brands_active", columnList = "is_active")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Brand extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "country_of_origin", length = 100)
    private String countryOfOrigin;

    @Column(name = "product_count")
    @Builder.Default
    private Integer productCount = 0;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
