package com.pricebrain.seller.service;

import com.pricebrain.seller.controller.SellerController.*;
import com.pricebrain.seller.dto.SellerDTOs.*;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.Seller;
import com.pricebrain.shared.model.Seller.VerificationStatus;
import com.pricebrain.shared.repository.SellerRepository;
import com.pricebrain.shared.repository.ProductRepository;
import com.pricebrain.shared.repository.OrderRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Seller service implementing business logic for seller operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SellerService {

    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final RedisService redisService;

    // ==================== PROFILE ====================

    /**
     * Get seller profile.
     */
    @Transactional(readOnly = true)
    public SellerProfileDTO getProfile(UUID userId) {
        log.info("Getting seller profile for user: {}", userId);

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new SellerException(ErrorCodes.SELLER_001));

        SellerStatsDTO stats = getSellerStats(seller.getId());

        return SellerProfileDTO.builder()
                .sellerId(seller.getId())
                .userId(seller.getUserId())
                .storeName(seller.getStoreName())
                .storeSlug(seller.getStoreSlug())
                .storeLogo(seller.getStoreLogo())
                .storeBanner(seller.getStoreBanner())
                .storeDescription(seller.getStoreDescription())
                .businessType(seller.getBusinessType())
                .contactEmail(seller.getContactEmail())
                .contactPhone(seller.getContactPhone())
                .gstin(seller.getGstin() != null ? maskString(seller.getGstin()) : null)
                .verificationStatus(seller.getVerificationStatus().name())
                .isActive(seller.getIsActive())
                .stats(stats)
                .build();
    }

    /**
     * Update seller profile.
     */
    @Transactional
    public SellerProfileDTO updateProfile(UUID userId, UpdateSellerProfileRequest request) {
        log.info("Updating seller profile for user: {}", userId);

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new SellerException(ErrorCodes.SELLER_001));

        if (request.getStoreName() != null) {
            seller.setStoreName(request.getStoreName());
        }
        if (request.getStoreDescription() != null) {
            seller.setStoreDescription(request.getStoreDescription());
        }
        if (request.getStoreLogo() != null) {
            seller.setStoreLogo(request.getStoreLogo());
        }
        if (request.getStoreBanner() != null) {
            seller.setStoreBanner(request.getStoreBanner());
        }
        if (request.getContactEmail() != null) {
            seller.setContactEmail(request.getContactEmail());
        }
        if (request.getContactPhone() != null) {
            seller.setContactPhone(request.getContactPhone());
        }

        seller = sellerRepository.save(seller);

        // Clear cache
        redisService.delete("seller:profile:" + seller.getId());

        log.info("Seller profile updated for user: {}", userId);
        return getProfile(userId);
    }

    /**
     * Update store settings.
     */
    @Transactional
    public StoreSettingsDTO updateStoreSettings(UUID userId, UpdateStoreSettingsRequest request) {
        log.info("Updating store settings for user: {}", userId);

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new SellerException(ErrorCodes.SELLER_001));

        if (request.getAllowCOD() != null) {
            seller.setAllowCOD(request.getAllowCOD());
        }
        if (request.getAllowReturns() != null) {
            seller.setAllowReturns(request.getAllowReturns());
        }
        if (request.getReturnWindowDays() != null) {
            seller.setReturnWindowDays(request.getReturnWindowDays());
        }
        if (request.getShippingPolicy() != null) {
            seller.setShippingPolicy(request.getShippingPolicy());
        }
        if (request.getRefundPolicy() != null) {
            seller.setRefundPolicy(request.getRefundPolicy());
        }

        seller = sellerRepository.save(seller);

        return StoreSettingsDTO.builder()
                .sellerId(seller.getId())
                .allowCOD(seller.getAllowCOD())
                .allowReturns(seller.getAllowReturns())
                .returnWindowDays(seller.getReturnWindowDays())
                .shippingPolicy(seller.getShippingPolicy())
                .refundPolicy(seller.getRefundPolicy())
                .businessHoursEnabled(seller.getBusinessHoursEnabled())
                .businessHours(seller.getBusinessHours())
                .build();
    }

    // ==================== KYC ====================

    /**
     * Submit KYC documents.
     */
    @Transactional
    public KYCStatusDTO submitKYC(UUID userId, SubmitKYCRequest request) {
        log.info("Submitting KYC for user: {}", userId);

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new SellerException(ErrorCodes.SELLER_001));

        // Update seller with KYC info
        seller.setBusinessType(request.getBusinessType());
        seller.setBusinessName(request.getBusinessName());
        seller.setGstin(request.getGstin());
        seller.setPanNumber(request.getPanNumber());
        seller.setBankAccountNumber(request.getBankAccountNumber());
        seller.setBankIfsc(request.getBankIfsc());
        seller.setBusinessAddress(request.getBusinessAddress());
        seller.setVerificationStatus(VerificationStatus.PENDING);
        seller.setKycSubmittedAt(java.time.Instant.now());

        seller = sellerRepository.save(seller);

        // TODO: Store KYC documents

        log.info("KYC submitted for user: {}", userId);

        return KYCStatusDTO.builder()
                .sellerId(seller.getId())
                .status("PENDING")
                .isVerified(false)
                .hasBusinessProof(request.getDocuments() != null && !request.getDocuments().isEmpty())
                .hasAddressProof(false) // TODO: Check documents
                .hasIdProof(false)
                .submittedAt(seller.getKycSubmittedAt())
                .build();
    }

    /**
     * Get KYC status.
     */
    @Transactional(readOnly = true)
    public KYCStatusDTO getKYCStatus(UUID userId) {
        log.info("Getting KYC status for user: {}", userId);

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new SellerException(ErrorCodes.SELLER_001));

        return KYCStatusDTO.builder()
                .sellerId(seller.getId())
                .status(seller.getVerificationStatus().name())
                .isVerified(seller.getVerificationStatus() == VerificationStatus.VERIFIED)
                .hasBusinessProof(seller.getGstin() != null)
                .hasAddressProof(seller.getBusinessAddress() != null)
                .hasIdProof(seller.getPanNumber() != null)
                .rejectionReason(seller.getVerificationStatus() == VerificationStatus.REJECTED 
                        ? seller.getRejectionReason() : null)
                .submittedAt(seller.getKycSubmittedAt())
                .verifiedAt(seller.getVerifiedAt())
                .build();
    }

    // ==================== DASHBOARD ====================

    /**
     * Get seller dashboard data.
     */
    @Transactional(readOnly = true)
    public SellerDashboardDTO getDashboard(UUID userId, String period) {
        log.info("Getting dashboard for user: {}, period: {}", userId, period);

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new SellerException(ErrorCodes.SELLER_001));

        // Get summary data
        SummaryDTO summary = getSummary(seller.getId(), period);

        // TODO: Get actual chart data from analytics
        List<ChartDataDTO> revenueChart = List.of();
        List<ChartDataDTO> ordersChart = List.of();
        List<TopProductDTO> topProducts = List.of();
        List<RecentOrderDTO> recentOrders = List.of();

        // Get alerts
        AlertsDTO alerts = AlertsDTO.builder()
                .pendingOrders(5) // TODO: Get from order service
                .lowStockProducts(3) // TODO: Get from inventory
                .pendingReturns(1) // TODO: Get from returns
                .expiringDocuments(0)
                .build();

        return SellerDashboardDTO.builder()
                .sellerId(seller.getId())
                .period(period)
                .summary(summary)
                .revenueChart(revenueChart)
                .ordersChart(ordersChart)
                .topProducts(topProducts)
                .recentOrders(recentOrders)
                .alerts(alerts)
                .build();
    }

    /**
     * Get revenue analytics.
     */
    @Transactional(readOnly = true)
    public RevenueAnalyticsDTO getRevenueAnalytics(UUID userId, String period) {
        log.info("Getting revenue analytics for user: {}, period: {}", userId, period);

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new SellerException(ErrorCodes.SELLER_001));

        // TODO: Get actual analytics from analytics service
        return RevenueAnalyticsDTO.builder()
                .totalRevenue(BigDecimal.valueOf(125000.00))
                .netRevenue(BigDecimal.valueOf(112500.00))
                .grossRevenue(BigDecimal.valueOf(125000.00))
                .averageOrderValue(BigDecimal.valueOf(2500.00))
                .totalRefunds(BigDecimal.valueOf(5000.00))
                .totalOrders(50)
                .cancelledOrders(2)
                .dailyRevenue(List.of())
                .hourlyDistribution(List.of())
                .build();
    }

    /**
     * Get product performance.
     */
    @Transactional(readOnly = true)
    public ProductPerformanceDTO getProductPerformance(UUID userId, int limit) {
        log.info("Getting product performance for user: {}", userId);

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new SellerException(ErrorCodes.SELLER_001));

        // TODO: Get actual performance from analytics
        return ProductPerformanceDTO.builder()
                .totalProducts(25)
                .activeProducts(20)
                .outOfStockProducts(3)
                .topPerformers(List.of())
                .slowMovers(List.of())
                .build();
    }

    // ==================== HELPERS ====================

    /**
     * Get seller statistics.
     */
    private SellerStatsDTO getSellerStats(UUID sellerId) {
        // TODO: Get actual stats from repositories
        return SellerStatsDTO.builder()
                .totalProducts(25)
                .activeProducts(20)
                .totalOrders(50)
                .pendingOrders(5)
                .completedOrders(42)
                .totalRevenue(BigDecimal.valueOf(125000.00))
                .monthlyRevenue(BigDecimal.valueOf(45000.00))
                .averageRating(4.5)
                .totalReviews(120)
                .build();
    }

    /**
     * Get dashboard summary.
     */
    private SummaryDTO getSummary(UUID sellerId, String period) {
        // TODO: Calculate from actual data
        return SummaryDTO.builder()
                .totalRevenue(BigDecimal.valueOf(45000.00))
                .revenueGrowth(BigDecimal.valueOf(15.5))
                .totalOrders(18)
                .ordersGrowth(BigDecimal.valueOf(12.0))
                .totalProducts(25)
                .averageOrderValue(BigDecimal.valueOf(2500.00))
                .conversionRate(BigDecimal.valueOf(3.5))
                .build();
    }

    /**
     * Mask sensitive string (show last 4 characters).
     */
    private String maskString(String input) {
        if (input == null || input.length() <= 4) {
            return input;
        }
        return "****" + input.substring(input.length() - 4);
    }

    /**
     * Custom seller exception.
     */
    public static class SellerException extends RuntimeException {
        private final ErrorCodes errorCode;

        public SellerException(ErrorCodes errorCode) {
            super(errorCode.getDefaultMessage());
            this.errorCode = errorCode;
        }

        public ErrorCodes getErrorCode() {
            return errorCode;
        }
    }
}
