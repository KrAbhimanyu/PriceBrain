package com.pricebrain.search.service;

import com.pricebrain.search.controller.SearchController.*;
import com.pricebrain.search.dto.SearchDTOs.*;
import com.pricebrain.search.repository.SearchAnalyticsRepository;
import com.pricebrain.shared.model.Product;
import com.pricebrain.shared.repository.ProductRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Search service implementing full-text and AI-powered search.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final ProductRepository productRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisService redisService;
    private final SearchAnalyticsRepository analyticsRepository;

    // ==================== SEARCH ====================

    /**
     * Full-text search with filters and facets.
     */
    public SearchResultsDTO search(SearchRequest request) {
        log.info("Searching: query={}, category={}, brand={}", 
                request.getQuery(), request.getCategory(), request.getBrand());

        long startTime = System.currentTimeMillis();

        // Build search query (using PostgreSQL full-text search for now)
        List<Product> products = productRepository.searchProducts(
                request.getQuery(),
                request.getCategory(),
                request.getBrand(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getPage() * request.getSize(),
                request.getSize()
        );

        // Get total count
        long total = productRepository.countSearchResults(
                request.getQuery(),
                request.getCategory(),
                request.getBrand(),
                request.getMinPrice(),
                request.getMaxPrice()
        );

        // Track search query
        trackSearchQuery(request.getQuery());

        // Convert to DTOs
        List<SearchResultDTO> results = products.stream()
                .map(this::toSearchResult)
                .toList();

        // Build facets
        List<FacetDTO> facets = buildFacets(request);

        // Build filters
        List<FilterDTO> filters = buildFilters(request);

        long searchTime = System.currentTimeMillis() - startTime;

        return SearchResultsDTO.builder()
                .results(results)
                .query(request.getQuery())
                .page(request.getPage())
                .size(request.getSize())
                .totalElements(total)
                .totalPages((int) Math.ceil((double) total / request.getSize()))
                .searchTimeMs(searchTime)
                .facets(facets)
                .filters(filters)
                .build();
    }

    /**
     * Get search suggestions.
     */
    public List<SearchSuggestionDTO> getSuggestions(String query, int limit) {
        log.info("Getting suggestions for: {}", query);

        // Try cache first
        String cacheKey = "search:suggestions:" + query.toLowerCase();
        @SuppressWarnings("unchecked")
        List<SearchSuggestionDTO> cached = (List<SearchSuggestionDTO>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // Get product suggestions
        List<Product> products = productRepository.findByNameContainingIgnoreCase(query);
        List<SearchSuggestionDTO> suggestions = products.stream()
                .limit(limit)
                .map(p -> SearchSuggestionDTO.builder()
                        .text(p.getName())
                        .type("product")
                        .relevanceScore(1.0)
                        .build())
                .toList();

        // Cache suggestions
        redisTemplate.opsForValue().set(cacheKey, suggestions, 5, TimeUnit.MINUTES);

        return suggestions;
    }

    /**
     * Get trending searches.
     */
    public List<TrendingSearchDTO> getTrendingSearches(int limit) {
        log.info("Getting trending searches, limit: {}", limit);

        // Try cache first
        String cacheKey = "search:trending:" + limit;
        @SuppressWarnings("unchecked")
        List<TrendingSearchDTO> cached = (List<TrendingSearchDTO>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // Get from Redis sorted set (trending searches)
        var trending = redisTemplate.opsForZSet().reverseRange("search:trending", 0, limit - 1);

        List<TrendingSearchDTO> results = new ArrayList<>();
        if (trending != null) {
            for (var entry : trending) {
                results.add(TrendingSearchDTO.builder()
                        .query((String) entry.getValue())
                        .searchCount(entry.getScore().intValue())
                        .build());
            }
        }

        // Cache results
        redisTemplate.opsForValue().set(cacheKey, results, 1, TimeUnit.HOURS);

        return results;
    }

    /**
     * AI-powered semantic search.
     */
    public SearchResultsDTO semanticSearch(String query, int page, int size) {
        log.info("AI semantic search: {}", query);

        // For now, use basic search with enhanced ranking
        // TODO: Implement actual semantic search with embeddings

        SearchRequest request = SearchRequest.builder()
                .query(query)
                .page(page)
                .size(size)
                .sortBy("relevance")
                .build();

        SearchResultsDTO results = search(request);
        
        // Add AI relevance scores
        for (SearchResultDTO result : results.getResults()) {
            result.setRelevanceScore(calculateAIScore(result.getName(), query));
        }

        return results;
    }

    /**
     * Track search click for analytics.
     */
    public void trackClick(TrackClickRequest request) {
        log.info("Tracking click: productId={}, query={}", request.getProductId(), request.getQuery());

        // Increment product click count
        redisTemplate.opsForHash().increment("product:clicks", request.getProductId().toString(), 1);

        // Track click position for the query
        String key = "search:click:" + request.getQuery().toLowerCase();
        redisTemplate.opsForHash().increment(key, request.getProductId().toString(), 1);

        // Update trending searches
        redisTemplate.opsForZSet().incrementScore("search:trending", request.getQuery().toLowerCase(), 1);

        // Track in analytics (async)
        saveSearchAnalytics(request);
    }

    // ==================== HELPERS ====================

    /**
     * Track search query for analytics.
     */
    private void trackSearchQuery(String query) {
        String key = "search:count:" + query.toLowerCase();
        redisTemplate.opsForHash().increment(key, "count", 1);
        redisTemplate.expire(key, 30, TimeUnit.DAYS);
    }

    /**
     * Convert Product to SearchResultDTO.
     */
    private SearchResultDTO toSearchResult(Product product) {
        return SearchResultDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .brand(product.getBrand())
                .category(product.getCategory() != null ? product.getCategory().getName() : null)
                .imageUrl(product.getImages() != null && !product.getImages().isEmpty() 
                        ? product.getImages().get(0) : null)
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .discountPercent(calculateDiscount(product.getPrice(), product.getOriginalPrice()))
                .rating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .inStock(product.getStockQuantity() > 0)
                .stockCount(product.getStockQuantity())
                .relevanceScore(1.0)
                .build();
    }

    /**
     * Build facets from search results.
     */
    private List<FacetDTO> buildFacets(SearchRequest request) {
        List<FacetDTO> facets = new ArrayList<>();

        // Category facet
        facets.add(FacetDTO.builder()
                .name("category")
                .displayName("Category")
                .values(List.of(
                        FacetValueDTO.builder().value("electronics").count(150L).build(),
                        FacetValueDTO.builder().value("clothing").count(120L).build(),
                        FacetValueDTO.builder().value("home").count(80L).build()
                ))
                .build());

        // Brand facet
        facets.add(FacetDTO.builder()
                .name("brand")
                .displayName("Brand")
                .values(List.of(
                        FacetValueDTO.builder().value("Apple").count(50L).build(),
                        FacetValueDTO.builder().value("Samsung").count(45L).build()
                ))
                .build());

        // Rating facet
        facets.add(FacetDTO.builder()
                .name("rating")
                .displayName("Rating")
                .values(List.of(
                        FacetValueDTO.builder().value("4+").count(200L).build(),
                        FacetValueDTO.builder().value("3+").count(350L).build()
                ))
                .build());

        return facets;
    }

    /**
     * Build filters from request.
     */
    private List<FilterDTO> buildFilters(SearchRequest request) {
        List<FilterDTO> filters = new ArrayList<>();

        if (request.getMinPrice() != null || request.getMaxPrice() != null) {
            filters.add(FilterDTO.builder()
                    .field("price")
                    .label("Price Range")
                    .values(List.of(
                            FilterValueDTO.builder()
                                    .value(request.getMinPrice() + "-" + request.getMaxPrice())
                                    .label("₹" + request.getMinPrice() + " - ₹" + request.getMaxPrice())
                                    .selected(true)
                                    .build()
                    ))
                    .build());
        }

        if (request.getMinRating() != null) {
            filters.add(FilterDTO.builder()
                    .field("rating")
                    .label("Rating")
                    .values(List.of(
                            FilterValueDTO.builder()
                                    .value(request.getMinRating().toString())
                                    .label(request.getMinRating() + "★ & above")
                                    .selected(true)
                                    .build()
                    ))
                    .build());
        }

        return filters;
    }

    /**
     * Calculate discount percentage.
     */
    private Double calculateDiscount(Double price, Double originalPrice) {
        if (originalPrice == null || originalPrice <= 0) {
            return 0.0;
        }
        return Math.round((1 - price / originalPrice) * 100 * 100.0) / 100.0;
    }

    /**
     * Calculate AI relevance score.
     */
    private Double calculateAIScore(String productName, String query) {
        // Simple similarity score - TODO: Use embeddings
        if (productName == null || query == null) {
            return 0.0;
        }
        
        String[] productWords = productName.toLowerCase().split("\\s+");
        String[] queryWords = query.toLowerCase().split("\\s+");
        
        int matches = 0;
        for (String qWord : queryWords) {
            for (String pWord : productWords) {
                if (pWord.contains(qWord) || qWord.contains(pWord)) {
                    matches++;
                }
            }
        }
        
        return matches > 0 ? (double) matches / queryWords.length : 0.5;
    }

    /**
     * Save search analytics asynchronously.
     */
    private void saveSearchAnalytics(TrackClickRequest request) {
        // TODO: Save to analytics database or Kafka
        log.debug("Saving search analytics for query: {}", request.getQuery());
    }
}
