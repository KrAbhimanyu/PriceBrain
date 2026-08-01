package com.pricebrain.shared.graph;

import lombok.*;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

import java.time.Instant;

/**
 * Neo4j node representing a product in the knowledge graph.
 */
@Node(labels = "Product")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductNode {

    @Id
    @GeneratedValue
    private Long id;

    @Property("productId")
    private String productId;

    @Property("name")
    private String name;

    @Property("slug")
    private String slug;

    @Property("categoryName")
    private String categoryName;

    @Property("brandName")
    private String brandName;

    @Property("price")
    private Double price;

    @Property("rating")
    private Double rating;

    @Property("reviewCount")
    private Integer reviewCount;

    @Property("sellerName")
    private String sellerName;

    @Property("createdAt")
    private Instant createdAt;
}
