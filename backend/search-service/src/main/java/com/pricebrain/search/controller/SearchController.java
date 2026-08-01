package com.pricebrain.search.controller;

import com.pricebrain.search.dto.SearchDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import com.pricebrain.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwgResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Search API endpoints for product search.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Product Search APIs")
public class SearchController extends BaseController {

    private final SearchService searchService;

    @Operation(summary = "Search products")
    @GetMapping
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Search results")
    })
    public ResponseEntity<ApiResponse<SearchResultsDTO>> search(
            @Parameter(description = "Search query")
            @RequestParam String q,
            @Parameter(description = "Filter by category")
            @RequestParam(required = false) String category,
            @Parameter(description = "Filter by brand")
            @RequestParam(required = false) String brand,
            @Parameter(description = "Minimum price")
            @RequestParam(required = false) Double minPrice,
            @Parameter(description = "Maximum price")
            @RequestParam(required = false) Double maxPrice,
            @Parameter(description = "Filter by rating")
            @RequestParam(required = false) Integer minRating,
            @Parameter(description = "Sort by")
            @RequestParam(defaultValue = "relevance") String sortBy,
            @Parameter(description = "Page number")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {

        log.info("Search request: q={}, category={}, brand={}", q, category, brand);

        SearchRequest request = SearchRequest.builder()
                .query(q)
                .category(category)
                .brand(brand)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minRating(minRating)
                .sortBy(sortBy)
                .page(page)
                .size(size)
                .build();

        SearchResultsDTO results = searchService.search(request);
        return success(results);
    }

    @Operation(summary = "Get search suggestions")
    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<SearchSuggestionDTO>>> getSuggestions(
            @Parameter(description = "Search query")
            @RequestParam String q,
            @Parameter(description = "Limit results")
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Get suggestions for: {}", q);
        List<SearchSuggestionDTO> suggestions = searchService.getSuggestions(q, limit);
        return success(suggestions);
    }

    @Operation(summary = "Get trending searches")
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<TrendingSearchDTO>>> getTrendingSearches(
            @Parameter(description = "Limit results")
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Get trending searches, limit: {}", limit);
        List<TrendingSearchDTO> trending = searchService.getTrendingSearches(limit);
        return success(trending);
    }

    @Operation(summary = "Get AI-powered semantic search")
    @GetMapping("/ai")
    public ResponseEntity<ApiResponse<SearchResultsDTO>> semanticSearch(
            @Parameter(description = "Natural language query")
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("AI semantic search: {}", q);
        SearchResultsDTO results = searchService.semanticSearch(q, page, size);
        return success(results);
    }

    @Operation(summary = "Track search click")
    @PostMapping("/click")
    public ResponseEntity<ApiResponse<Void>> trackClick(
            @RequestBody TrackClickRequest request) {

        log.info("Track click: productId={}, query={}", request.getProductId(), request.getQuery());
        searchService.trackClick(request);
        return success("Click tracked");
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Search results")
    public static class SearchResultsDTO {
        private List<SearchResultDTO> results;
        private String query;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private Long searchTimeMs;
        private List<FilterDTO> filters;
        private List<FacetDTO> facets;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Single search result")
    public static class SearchResultDTO {
        private UUID productId;
        private String name;
        private String brand;
        private String category;
        private String imageUrl;
        private Double price;
        private Double originalPrice;
        private Double discountPercent;
        private Double rating;
        private Integer reviewCount;
        private Boolean inStock;
        private Integer stockCount;
        private Double relevanceScore;
        private List<String> highlights;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Search suggestion")
    public static class SearchSuggestionDTO {
        private String text;
        private String type; // product, category, brand
        private Integer searchCount;
        private Double relevanceScore;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Trending search")
    public static class TrendingSearchDTO {
        private String query;
        private Integer searchCount;
        private Integer clickCount;
        private Double clickRate;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Search filter")
    public static class FilterDTO {
        private String field;
        private String label;
        private List<FilterValueDTO> values;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Filter value")
    public static class FilterValueDTO {
        private String value;
        private String label;
        private Long count;
        private Boolean selected;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Search facet")
    public static class FacetDTO {
        private String name;
        private String displayName;
        private List<FacetValueDTO> values;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Facet value")
    public static class FacetValueDTO {
        private String value;
        private Long count;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Track click request")
    public static class TrackClickRequest {
        private String query;
        private UUID productId;
        private Integer position;
        private UUID userId;
    }
}
