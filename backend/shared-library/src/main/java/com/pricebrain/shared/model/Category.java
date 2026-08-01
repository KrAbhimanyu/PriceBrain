package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

/**
 * Category entity for product categorization.
 */
@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_categories_slug", columnList = "slug"),
    @Index(name = "idx_categories_parent", columnList = "parent_id"),
    @Index(name = "idx_categories_active", columnList = "is_active")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon", length = 100)
    private String icon;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "parent_id")
    private UUID parentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private Category parent;

    @Column(name = "level")
    @Builder.Default
    private Integer level = 0;

    @Column(name = "path")
    private String path;

    @Column(name = "product_count")
    @Builder.Default
    private Integer productCount = 0;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
