package com.pricebrain.search.repository;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Search analytics repository for tracking search behavior.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "search_analytics")
@CompoundIndex(name = "query_date_idx", def = "{'query': 1, 'date': -1}")
class SearchAnalytics {

    @Id
    private String id;

    @Indexed
    private String query;

    private Integer resultCount;

    private UUID userId;

    private Instant timestamp;

    private String sessionId;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "search_clicks")
class SearchClick {

    @Id
    private String id;

    @Indexed
    private String query;

    private UUID productId;

    private Integer position;

    private UUID userId;

    private Instant timestamp;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "search_suggestions_cache")
class SuggestionCache {

    @Id
    private String query;

    private List<String> suggestions;

    private Instant createdAt;
}

@Repository
interface SearchAnalyticsRepository extends MongoRepository<SearchAnalytics, String> {
    List<SearchAnalytics> findByQuery(String query);
    List<SearchAnalytics> findByUserId(UUID userId);
    Optional<SearchAnalytics> findTopByQueryOrderByResultCountDesc(String query);
}

@Repository
interface SearchClickRepository extends MongoRepository<SearchClick, String> {
    List<SearchClick> findByQuery(String query);
    List<SearchClick> findByProductId(UUID productId);
    long countByQuery(String query);
}

@Repository
interface SuggestionCacheRepository extends MongoRepository<SuggestionCache, String> {
    Optional<SuggestionCache> findByQueryIgnoreCase(String query);
}
