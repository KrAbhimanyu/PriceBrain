package com.pricebrain.product.service;

import com.pricebrain.product.controller.ProductController.*;
import com.pricebrain.product.service.ProductService.ProductException;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.Product;
import com.pricebrain.shared.model.Product.ProductStatus;
import com.pricebrain.shared.repository.BrandRepository;
import com.pricebrain.shared.repository.CategoryRepository;
import com.pricebrain.shared.repository.ProductRepository;
import com.pricebrain.shared.service.RedisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ProductService.
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private RedisService redisService;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private CreateProductRequest createRequest;
    private UUID sellerId;
    private UUID productId;

    @BeforeEach
    void setUp() {
        sellerId = UUID.randomUUID();
        productId = UUID.randomUUID();

        testProduct = Product.builder()
                .id(productId)
                .sellerId(sellerId)
                .name("Test Product")
                .slug("test-product")
                .description("Test description")
                .sellingPrice(BigDecimal.valueOf(999.00))
                .mrp(BigDecimal.valueOf(1299.00))
                .discountPercent(BigDecimal.valueOf(23.1))
                .stockQuantity(50)
                .status(ProductStatus.APPROVED)
                .viewCount(100)
                .wishlistCount(10)
                .orderCount(25)
                .isFeatured(false)
                .isBestseller(true)
                .build();

        createRequest = CreateProductRequest.builder()
                .name("New Product")
                .slug("new-product")
                .description("New product description")
                .sellingPrice(BigDecimal.valueOf(899.00))
                .mrp(BigDecimal.valueOf(1199.00))
                .stockQuantity(100)
                .build();
    }

    @Test
    @DisplayName("Get product by ID should return product")
    void getProductById_Success() {
        // Arrange
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        doNothing().when(productRepository).incrementViewCount(productId);
        doNothing().when(redisService).recordProductView(anyString(), any());

        // Act
        ProductDTO result = productService.getProductById(productId);

        // Assert
        assertNotNull(result);
        assertEquals(productId, result.getId());
        assertEquals("Test Product", result.getName());
        assertEquals("test-product", result.getSlug());
        assertEquals(BigDecimal.valueOf(999.00), result.getSellingPrice());
        assertTrue(result.getInStock());

        verify(productRepository).findById(productId);
        verify(productRepository).incrementViewCount(productId);
        verify(redisService).recordProductView(productId.toString(), null);
    }

    @Test
    @DisplayName("Get product by ID should throw exception for non-existent product")
    void getProductById_NotFound() {
        // Arrange
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // Act & Assert
        ProductException exception = assertThrows(ProductException.class,
                () -> productService.getProductById(productId));

        assertEquals(ErrorCodes.PROD_001, exception.getErrorCode());
    }

    @Test
    @DisplayName("Get product by slug should return product")
    void getProductBySlug_Success() {
        // Arrange
        when(productRepository.findBySlug("test-product")).thenReturn(Optional.of(testProduct));
        doNothing().when(productRepository).incrementViewCount(productId);

        // Act
        ProductDTO result = productService.getProductBySlug("test-product");

        // Assert
        assertNotNull(result);
        assertEquals("test-product", result.getSlug());
        verify(productRepository).findBySlug("test-product");
    }

    @Test
    @DisplayName("Create product should save and return product")
    void createProduct_Success() {
        // Arrange
        when(productRepository.existsBySlug("new-product")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        // Act
        ProductDTO result = productService.createProduct(createRequest, sellerId);

        // Assert
        assertNotNull(result);
        assertEquals("New Product", result.getName());
        assertEquals("new-product", result.getSlug());
        assertNotNull(result.getDiscountPercent());

        verify(productRepository).existsBySlug("new-product");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Create product should throw exception for duplicate slug")
    void createProduct_DuplicateSlug() {
        // Arrange
        when(productRepository.existsBySlug("new-product")).thenReturn(true);

        // Act & Assert
        ProductException exception = assertThrows(ProductException.class,
                () -> productService.createProduct(createRequest, sellerId));

        assertEquals(ErrorCodes.PROD_002, exception.getErrorCode());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Update product should update fields successfully")
    void updateProduct_Success() {
        // Arrange
        UpdateProductRequest updateRequest = UpdateProductRequest.builder()
                .name("Updated Product")
                .sellingPrice(BigDecimal.valueOf(799.00))
                .stockQuantity(75)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        ProductDTO result = productService.updateProduct(productId, updateRequest, sellerId);

        // Assert
        assertNotNull(result);
        verify(productRepository).save(testProduct);
    }

    @Test
    @DisplayName("Update product should throw exception for unauthorized seller")
    void updateProduct_UnauthorizedSeller() {
        // Arrange
        UUID otherSellerId = UUID.randomUUID();
        UpdateProductRequest updateRequest = UpdateProductRequest.builder()
                .name("Updated Product")
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));

        // Act & Assert
        ProductException exception = assertThrows(ProductException.class,
                () -> productService.updateProduct(productId, updateRequest, otherSellerId));

        assertEquals(ErrorCodes.AUTHZ_004, exception.getErrorCode());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Delete product should archive product")
    void deleteProduct_Success() {
        // Arrange
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        productService.deleteProduct(productId, sellerId);

        // Assert
        verify(productRepository).findById(productId);
        verify(productRepository).save(any(Product.class));
        assertEquals(ProductStatus.ARCHIVED, testProduct.getStatus());
    }

    @Test
    @DisplayName("Get featured products should return featured products")
    void getFeaturedProducts_Success() {
        // Arrange
        testProduct.setIsFeatured(true);
        List<Product> featuredProducts = List.of(testProduct);
        
        when(productRepository.findByIsFeaturedTrueAndStatus(any(ProductStatus.class)))
                .thenReturn(featuredProducts);

        // Act
        List<ProductSummaryDTO> result = productService.getFeaturedProducts(10);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Product", result.get(0).getName());
    }

    @Test
    @DisplayName("Get bestsellers should return bestseller products")
    void getBestsellers_Success() {
        // Arrange
        List<Product> bestsellers = List.of(testProduct);
        
        when(productRepository.findByIsBestsellerTrueAndStatus(any(ProductStatus.class), any(Pageable.class)))
                .thenReturn(bestsellers);

        // Act
        List<ProductSummaryDTO> result = productService.getBestsellers(null, 10);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Search products should return matching products")
    void searchProducts_Success() {
        // Arrange
        Page<Product> productPage = new PageImpl<>(List.of(testProduct), PageRequest.of(0, 20), 1);
        
        when(productRepository.searchProducts(anyString(), any(Pageable.class)))
                .thenReturn(productPage);

        // Act
        SearchResponseDTO result = productService.searchProducts("test", null, null, null, null, PageRequest.of(0, 20));

        // Assert
        assertNotNull(result);
        assertEquals("test", result.getQuery());
        assertEquals(1, result.getTotalResults());
        assertEquals(1, result.getResults().size());
    }

    @Test
    @DisplayName("Get products with filters should apply filters")
    void getProducts_WithFilters() {
        // Arrange
        Page<Product> productPage = new PageImpl<>(List.of(testProduct), PageRequest.of(0, 20), 1);
        
        when(productRepository.findByStatus(any(ProductStatus.class), any(Pageable.class)))
                .thenReturn(productPage);

        // Act
        Page<ProductSummaryDTO> result = productService.getProducts(
                null, null, BigDecimal.valueOf(500), BigDecimal.valueOf(1500), 
                4, true, PageRequest.of(0, 20));

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
}
