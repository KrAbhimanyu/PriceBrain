package com.pricebrain.shared.graph;

import lombok.*;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

import java.time.Instant;

/**
 * Neo4j node representing a user in the knowledge graph.
 */
@Node(labels = "User")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserNode {

    @Id
    @GeneratedValue
    private Long id;

    @Property("userId")
    private String userId;

    @Property("email")
    private String email;

    @Property("role")
    private String role;

    @Property("totalOrders")
    private Integer totalOrders;

    @Property("totalSpent")
    private Double totalSpent;

    @Property("preferredCategories")
    private String preferredCategories;

    @Property("createdAt")
    private Instant createdAt;
}
