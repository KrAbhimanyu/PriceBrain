package com.pricebrain.product.service;

import com.pricebrain.product.controller.ProductController.*;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.Product;
import com.pricebrain.shared.model.Product.ProductStatus;
import com.pricebrain.shared.repository.ProductRepository;
import com.pricebrain.shared.repository.CategoryRepository;
import com.pricebrain.shared.repository.BrandRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Product service implementing business logic for product operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final RedisService redisService;

    // Cache names
    private static final String CACHE_PRODUCTS = "products";
    private static final String CACHE_PRODUCT_DETAIL = "product-detail";
    private static final String CACHE_CATEGORIES = "categories";

    /**
     * Get all products with pagination and filtering.
     */
    @Transactional(readOnly = true)
    public Page<ProductSummaryDTO> getProducts(
            UUID categoryId,
            UUID brandId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minRating,
            boolean inStock,
            Pageable pageable) {

        log.info("Getting products - category: {}, brand: {}, page: {}",
                categoryId, brandId, pageable.getPageNumber());

        // Build query based on filters
        // For now, return all products
        Page<Product> products = productRepository.findByStatus(ProductStatus.APPROVED, pageable);

        return products.map(this::toProductSummary);
    }

    /**
     * Get product by ID.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_PRODUCT_DETAIL, key = "#productId")
    public ProductDTO getProductById(UUID productId) {
        log.info("Getting product by ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductException(ErrorCodes.PROD_001));

        // Increment view count asynchronously
        productRepository.incrementViewCount(productId);

        // Record view in Redis
        redisService.recordProductView(productId.toString(), null);

        return toProductDTO(product);
    }

    /**
     * Get product by slug.
     */
    @Transactional(readOnly = true)
    public ProductDTO getProductBySlug(String slug) {
        log.info("Getting product by slug: {}", slug);

        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ProductException(ErrorCodes.PROD_001));

        // Increment view count
        productRepository.incrementViewCount(product.getId());

        return toProductDTO(product);
    }

    /**
     * Create a new product.
     */
    @Transactional
    @CacheEvict(value = {CACHE_PRODUCTS, CACHE_CATEGORIES}, allEntries = true)
    public ProductDTO createProduct(CreateProductRequest request, UUID sellerId) {
        log.info("Creating product for seller: {}", sellerId);

        // Validate slug uniqueness
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new ProductException(ErrorCodes.PROD_002);
        }

        // Calculate discount
        BigDecimal discountPercent = null;
        if (request.getMrp() != null && request.getSellingPrice() != null
                && request.getMrp().compareTo(BigDecimal.ZERO) > 0) {
            discountPercent = request.getMrp()
                    .subtract(request.getSellingPrice())
                    .divide(request.getMrp(), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        Product product = Product.builder()
                .sellerId(sellerId)
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .categoryId(request.getCategoryId())
                .brandId(request.getBrandId())
                .mrp(request.getMrp())
                .sellingPrice(request.getSellingPrice())
                .discountPercent(discountPercent)
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .status(ProductStatus.DRAFT)
                .viewCount(0)
                .wishlistCount(0)
                .orderCount(0)
                .build();

        product = productRepository.save(product);
        log.info("Product created: {}", product.getId());

        return toProductDTO(product);
    }

    /**
     * Update an existing product.
     */
    @Transactional
    @CacheEvict(value = {CACHE_PRODUCTS, CACHE_PRODUCT_DETAIL, CACHE_CATEGORIES}, allEntries = true)
    public ProductDTO updateProduct(UUID productId, UpdateProductRequest request, UUID sellerId) {
        log.info("Updating product: {} by seller: {}", productId, sellerId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductException(ErrorCodes.PROD_001));

        // Verify ownership
        if (!product.getSellerId().equals(sellerId)) {
            throw new ProductException(ErrorCodes.AUTHZ_004);
        }

        // Update fields
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getSellingPrice() != null) {
            product.setSellingPrice(request.getSellingPrice());
            // Recalculate discount
            if (product.getMrp() != null) {
                product.setDiscountPercent(
                        product.getMrp().subtract(request.getSellingPrice())
                                .divide(product.getMrp(), 4, BigDecimal.ROUND_HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                );
            }
        }
        if (request.getMrp() != null) {
            product.setMrp(request.getMrp());
        }
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getHighlights() != null) {
            product.setHighlights(request.getHighlights());
        }

        product = productRepository.save(product);
        log.info("Product updated: {}", product.getId());

        return toProductDTO(product);
    }

    /**
     * Delete (archive) a product.
     */
    @Transactional
    @CacheEvict(value = {CACHE_PRODUCTS, CACHE_PRODUCT_DETAIL, CACHE_CATEGORIES}, allEntries = true)
    public void deleteProduct(UUID productId, UUID sellerId) {
        log.info("Deleting product: {} by seller: {}", productId, sellerId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductException(ErrorCodes.PROD_001));

        // Verify ownership
        if (!product.getSellerId().equals(sellerId)) {
            throw new ProductException(ErrorCodes.AUTHZ_004);
        }

        // Soft delete - change status to ARCHIVED
        product.setStatus(ProductStatus.ARCHIVED);
        productRepository.save(product);

        log.info("Product archived: {}", productId);
    }

    /**
     * Search products.
     */
    @Transactional(readOnly = true)
    public SearchResponseDTO searchProducts(String query, UUID categoryId, UUID brandId,
                                           BigDecimal minPrice, BigDecimal maxPrice,
                                           Pageable pageable) {
        log.info("Searching products - query: {}", query);

        // Use repository search
        Page<Product> products = productRepository.searchProducts(query, pageable);

        List<SearchResultDTO> results = products.getContent().stream()
                .map(p -> SearchResultDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .slug(p.getSlug())
                        .price(p.getSellingPrice())
                        .relevanceScore(1.0) // TODO: Calculate actual relevance
                        .primaryImageUrl(null)
                        .build())
                .toList();

        return SearchResponseDTO.builder()
                .query(query)
                .totalResults(products.getTotalElements())
                .page(products.getNumber())
                .size(products.getSize())
                .results(results)
                .facets(List.of())
                .build();
    }

    /**
     * Get featured products.
     */
    @Transactional(readOnly = true)
    public List<ProductSummaryDTO> getFeaturedProducts(int limit) {
        log.info("Getting featured products - limit: {}", limit);

        List<Product> products = productRepository.findByIsFeaturedTrueAndStatus(ProductStatus.APPROVED);

        return products.stream()
                .limit(limit)
                .map(this::toProductSummary)
                .toList();
    }

    /**
     * Get bestseller products.
     */
    @Transactional(readOnly = true)
    public List<ProductSummaryDTO> getBestsellers(UUID categoryId, int limit) {
        log.info("Getting bestsellers - category: {}, limit: {}", categoryId, limit);

        List<Product> products = productRepository.findByIsBestsellerTrueAndStatus(
                ProductStatus.APPROVED, Pageable.ofSize(limit));

        return products.stream()
                .map(this::toProductSummary)
                .toList();
    }

    /**
     * Get newly arrived products.
     */
    @Transactional(readOnly = true)
    public List<ProductSummaryDTO> getNewArrivals(UUID categoryId, int limit) {
        log.info("Getting new arrivals - category: {}, limit: {}", categoryId, limit);

        List<Product> products = productRepository.findRecentlyAdded(Pageable.ofSize(limit));

        return products.stream()
                .map(this::toProductSummary)
                .toList();
    }

    /**
     * Convert Product entity to DTO.
     */
    private ProductDTO toProductDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .sellerId(product.getSellerId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .highlights(product.getHighlights())
                .categoryId(product.getCategoryId())
                .brandId(product.getBrandId())
                .mrp(product.getMrp())
                .sellingPrice(product.getSellingPrice())
                .discountPercent(product.getDiscountPercent())
                .stockQuantity(product.getStockQuantity())
                .inStock(product.getStockQuantity() != null && product.getStockQuantity() > 0)
                .isFeatured(product.getIsFeatured())
                .isBestseller(product.getIsBestseller())
                .status(product.getStatus().name())
                .rating(null) // TODO: Calculate from reviews
                .reviewCount(product.getReviewCount())
                .viewCount(product.getViewCount())
                .build();
    }

    /**
     * Convert Product entity to summary DTO.
     */
    private ProductSummaryDTO toProductSummary(Product product) {
        return ProductSummaryDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .sellingPrice(product.getSellingPrice())
                .originalPrice(product.getMrp())
                .discountPercent(product.getDiscountPercent())
                .rating(null)
                .reviewCount(product.getReviewCount())
                .inStock(product.getStockQuantity() != null && product.getStockQuantity() > 0)
                .build();
    }

    /**
     * Custom product exception.
     */
    public static class ProductException extends RuntimeException {
        private final ErrorCodes errorCode;

        public ProductException(ErrorCodes errorCode) {
            super(errorCode.getDefaultMessage());
            this.errorCode = errorCode;
        }

        public ErrorCodes getErrorCode() {
            return errorCode;
        }
    }
}
