package com.pricebrain.seller.controller;

import com.pricebrain.seller.dto.SellerDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import com.pricebrain.seller.service.SellerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwgResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Seller API endpoints for seller management, KYC, and dashboard.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/sellers")
@RequiredArgsConstructor
@Tag(name = "Sellers", description = "Seller Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class SellerController extends BaseController {

    private final SellerService sellerService;

    // ==================== PROFILE ====================

    @Operation(summary = "Get seller profile")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<SellerProfileDTO>> getProfile(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get seller profile for user: {}", userId);
        SellerProfileDTO profile = sellerService.getProfile(userId);
        return success(profile);
    }

    @Operation(summary = "Update seller profile")
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<SellerProfileDTO>> updateProfile(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody UpdateSellerProfileRequest request) {

        log.info("Update seller profile for user: {}", userId);
        SellerProfileDTO profile = sellerService.updateProfile(userId, request);
        return success(profile, "Profile updated successfully");
    }

    @Operation(summary = "Update store settings")
    @PutMapping("/store")
    public ResponseEntity<ApiResponse<StoreSettingsDTO>> updateStoreSettings(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody UpdateStoreSettingsRequest request) {

        log.info("Update store settings for user: {}", userId);
        StoreSettingsDTO settings = sellerService.updateStoreSettings(userId, request);
        return success(settings, "Store settings updated successfully");
    }

    // ==================== KYC ====================

    @Operation(summary = "Submit KYC documents")
    @PostMapping("/kyc")
    public ResponseEntity<ApiResponse<KYCStatusDTO>> submitKYC(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody SubmitKYCRequest request) {

        log.info("Submit KYC for user: {}", userId);
        KYCStatusDTO status = sellerService.submitKYC(userId, request);
        return success(status, "KYC submitted successfully");
    }

    @Operation(summary = "Get KYC status")
    @GetMapping("/kyc/status")
    public ResponseEntity<ApiResponse<KYCStatusDTO>> getKYCStatus(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get KYC status for user: {}", userId);
        KYCStatusDTO status = sellerService.getKYCStatus(userId);
        return success(status);
    }

    // ==================== DASHBOARD ====================

    @Operation(summary = "Get seller dashboard")
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<SellerDashboardDTO>> getDashboard(
            @RequestHeader("X-User-ID") UUID userId,
            @Parameter(description = "Period (today/week/month/year)")
            @RequestParam(defaultValue = "month") String period) {

        log.info("Get dashboard for user: {}, period: {}", userId, period);
        SellerDashboardDTO dashboard = sellerService.getDashboard(userId, period);
        return success(dashboard);
    }

    @Operation(summary = "Get revenue analytics")
    @GetMapping("/analytics/revenue")
    public ResponseEntity<ApiResponse<RevenueAnalyticsDTO>> getRevenueAnalytics(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "month") String period) {

        log.info("Get revenue analytics for user: {}", userId);
        RevenueAnalyticsDTO analytics = sellerService.getRevenueAnalytics(userId, period);
        return success(analytics);
    }

    @Operation(summary = "Get product performance")
    @GetMapping("/analytics/products")
    public ResponseEntity<ApiResponse<ProductPerformanceDTO>> getProductPerformance(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Get product performance for user: {}", userId);
        ProductPerformanceDTO performance = sellerService.getProductPerformance(userId, limit);
        return success(performance);
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Seller profile")
    public static class SellerProfileDTO {
        private UUID sellerId;
        private UUID userId;
        private String storeName;
        private String storeSlug;
        private String storeLogo;
        private String storeBanner;
        private String storeDescription;
        private String businessType;
        private String contactEmail;
        private String contactPhone;
        private String gstin;
        private String panNumber;
        private String verificationStatus;
        private Boolean isActive;
        private SellerStatsDTO stats;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Seller statistics")
    public static class SellerStatsDTO {
        private Integer totalProducts;
        private Integer activeProducts;
        private Integer totalOrders;
        private Integer pendingOrders;
        private Integer completedOrders;
        private BigDecimal totalRevenue;
        private BigDecimal monthlyRevenue;
        private BigDecimal averageRating;
        private Integer totalReviews;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update seller profile request")
    public static class UpdateSellerProfileRequest {
        private String storeName;
        private String storeDescription;
        private String storeLogo;
        private String storeBanner;
        private String contactEmail;
        private String contactPhone;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Store settings")
    public static class StoreSettingsDTO {
        private UUID sellerId;
        private Boolean allowCOD;
        private Boolean allowReturns;
        private Integer returnWindowDays;
        private String shippingPolicy;
        private String refundPolicy;
        private Boolean businessHoursEnabled;
        private String businessHours;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update store settings request")
    public static class UpdateStoreSettingsRequest {
        private Boolean allowCOD;
        private Boolean allowReturns;
        private Integer returnWindowDays;
        private String shippingPolicy;
        private String refundPolicy;
        private Boolean businessHoursEnabled;
        private String businessHours;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "KYC status")
    public static class KYCStatusDTO {
        private UUID sellerId;
        private String status;
        private Boolean isVerified;
        private Boolean hasBusinessProof;
        private Boolean hasAddressProof;
        private Boolean hasIdProof;
        private String rejectionReason;
        private java.time.Instant submittedAt;
        private java.time.Instant verifiedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Submit KYC request")
    public static class SubmitKYCRequest {
        private String businessType;
        private String businessName;
        private String gstin;
        private String panNumber;
        private String bankAccountNumber;
        private String bankIfsc;
        private String businessAddress;
        private List<KYC DocumentDTO> documents;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "KYC document")
    public static class KYCDocumentDTO {
        private String type;
        private String documentNumber;
        private String documentUrl;
        private String expiryDate;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Seller dashboard")
    public static class SellerDashboardDTO {
        private UUID sellerId;
        private String period;
        private SummaryDTO summary;
        private List<ChartDataDTO> revenueChart;
        private List<ChartDataDTO> ordersChart;
        private List<TopProductDTO> topProducts;
        private List<RecentOrderDTO> recentOrders;
        private AlertsDTO alerts;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Dashboard summary")
    public static class SummaryDTO {
        private BigDecimal totalRevenue;
        private BigDecimal revenueGrowth;
        private Integer totalOrders;
        private Integer ordersGrowth;
        private Integer totalProducts;
        private BigDecimal averageOrderValue;
        private BigDecimal conversionRate;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Chart data")
    public static class ChartDataDTO {
        private String date;
        private BigDecimal value;
        private Integer count;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Top product")
    public static class TopProductDTO {
        private UUID productId;
        private String productName;
        private String image;
        private Integer unitsSold;
        private BigDecimal revenue;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Recent order")
    public static class RecentOrderDTO {
        private UUID orderId;
        private String orderNumber;
        private String status;
        private BigDecimal amount;
        private String buyerName;
        private java.time.LocalDateTime orderedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Dashboard alerts")
    public static class AlertsDTO {
        private Integer pendingOrders;
        private Integer lowStockProducts;
        private Integer pendingReturns;
        private Integer expiringDocuments;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Revenue analytics")
    public static class RevenueAnalyticsDTO {
        private BigDecimal totalRevenue;
        private BigDecimal netRevenue;
        private BigDecimal grossRevenue;
        private BigDecimal averageOrderValue;
        private BigDecimal totalRefunds;
        private Integer totalOrders;
        private Integer cancelledOrders;
        private BigDecimal revenueByCategory;
        private List<ChartDataDTO> dailyRevenue;
        private List<ChartDataDTO> hourlyDistribution;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Product performance")
    public static class ProductPerformanceDTO {
        private Integer totalProducts;
        private Integer activeProducts;
        private Integer outOfStockProducts;
        private List<ProductAnalyticsDTO> topPerformers;
        private List<ProductAnalyticsDTO> slowMovers;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Product analytics")
    public static class ProductAnalyticsDTO {
        private UUID productId;
        private String productName;
        private String image;
        private Integer views;
        private Integer orders;
        private Integer conversionRate;
        private BigDecimal revenue;
        private BigDecimal revenueShare;
    }
}
