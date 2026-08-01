package com.pricebrain.shared.graph;

import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

/**
 * Neo4j relationship representing user interactions with products.
 */
@RelationshipProperties
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchasedRelationship {

    @TargetNode
    private ProductNode product;

    private Integer quantity;

    private Double totalSpent;

    private Instant purchasedAt;
}

/**
 * Neo4j relationship representing user viewing products.
 */
@RelationshipProperties
@Data
@NoArgsConstructor
@AllArgsConstructor
class ViewedRelationship {

    @TargetNode
    private ProductNode product;

    private Integer viewCount;

    private Instant lastViewed;
}

/**
 * Neo4j relationship representing user wishlisting products.
 */
@RelationshipProperties
@Data
@NoArgsConstructor
@AllArgsConstructor
class WishlistedRelationship {

    @TargetNode
    private ProductNode product;

    private Instant addedAt;

    private Double targetPrice;
}

/**
 * Neo4j relationship representing user ratings/reviews.
 */
@RelationshipProperties
@Data
@NoArgsConstructor
@AllArgsConstructor
class RatedRelationship {

    @TargetNode
    private ProductNode product;

    private Integer rating;

    private String reviewId;

    private Instant ratedAt;
}

/**
 * Neo4j relationship representing product similarity.
 */
@RelationshipProperties
@Data
@NoArgsConstructor
@AllArgsConstructor
class SimilarToRelationship {

    @TargetNode
    private ProductNode product;

    private Double similarityScore;

    private String similarityType; // "content", "collaborative", "behavioral"
}

/**
 * Neo4j relationship representing products bought together.
 */
@RelationshipProperties
@Data
@NoArgsConstructor
@AllArgsConstructor
class OftenBoughtTogetherRelationship {

    @TargetNode
    private ProductNode product;

    private Integer coPurchaseCount;

    private Double confidence;
}
