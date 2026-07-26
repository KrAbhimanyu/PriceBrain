package com.pricebrain.payment.controller;

import com.pricebrain.payment.dto.PaymentDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import com.pricebrain.payment.service.PaymentService;
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
import java.util.List;
import java.util.UUID;

/**
 * Payment API endpoints for payment processing and wallet management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment Processing APIs")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController extends BaseController {

    private final PaymentService paymentService;

    // ==================== PAYMENTS ====================

    @Operation(summary = "Get payment by ID")
    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPayment(
            @PathVariable UUID paymentId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get payment: {} for user: {}", paymentId, userId);
        PaymentDTO payment = paymentService.getPayment(paymentId, userId);
        return success(payment);
    }

    @Operation(summary = "Get payment by order ID")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentByOrder(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get payment for order: {}", orderId);
        PaymentDTO payment = paymentService.getPaymentByOrderId(orderId, userId);
        return success(payment);
    }

    @Operation(summary = "Initiate payment")
    @PostMapping("/initiate")
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Payment initiated"),
            @SwgResponse(responseCode = "400", description = "Invalid request"),
            @SwgResponse(responseCode = "402", description = "Payment required")
    })
    public ResponseEntity<ApiResponse<PaymentInitiationDTO>> initiatePayment(
            @Valid @RequestBody InitiatePaymentRequest request,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Initiate payment for user: {}, order: {}", userId, request.getOrderId());
        PaymentInitiationDTO result = paymentService.initiatePayment(userId, request);
        return success(result);
    }

    @Operation(summary = "Confirm payment")
    @PostMapping("/{paymentId}/confirm")
    public ResponseEntity<ApiResponse<PaymentDTO>> confirmPayment(
            @PathVariable UUID paymentId,
            @Valid @RequestBody ConfirmPaymentRequest request) {

        log.info("Confirm payment: {}", paymentId);
        PaymentDTO payment = paymentService.confirmPayment(paymentId, request);
        return success(payment, "Payment confirmed successfully");
    }

    @Operation(summary = "Cancel payment")
    @PostMapping("/{paymentId}/cancel")
    public ResponseEntity<ApiResponse<PaymentDTO>> cancelPayment(
            @PathVariable UUID paymentId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Cancel payment: {} for user: {}", paymentId, userId);
        PaymentDTO payment = paymentService.cancelPayment(paymentId, userId);
        return success(payment, "Payment cancelled");
    }

    // ==================== REFUNDS ====================

    @Operation(summary = "Get refunds for order")
    @GetMapping("/refunds/order/{orderId}")
    public ResponseEntity<ApiResponse<List<RefundDTO>>> getRefunds(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get refunds for order: {}", orderId);
        List<RefundDTO> refunds = paymentService.getRefundsForOrder(orderId, userId);
        return success(refunds);
    }

    @Operation(summary = "Request refund")
    @PostMapping("/refunds")
    public ResponseEntity<ApiResponse<RefundDTO>> requestRefund(
            @Valid @RequestBody RefundRequest request,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Refund request for user: {}", userId);
        RefundDTO refund = paymentService.requestRefund(userId, request);
        return created(refund, "Refund requested successfully");
    }

    @Operation(summary = "Get refund status")
    @GetMapping("/refunds/{refundId}")
    public ResponseEntity<ApiResponse<RefundDTO>> getRefundStatus(
            @PathVariable UUID refundId,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get refund status: {}", refundId);
        RefundDTO refund = paymentService.getRefundStatus(refundId, userId);
        return success(refund);
    }

    // ==================== WALLET ====================

    @Operation(summary = "Get wallet")
    @GetMapping("/wallet")
    public ResponseEntity<ApiResponse<WalletDTO>> getWallet(
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get wallet for user: {}", userId);
        WalletDTO wallet = paymentService.getWallet(userId);
        return success(wallet);
    }

    @Operation(summary = "Add money to wallet")
    @PostMapping("/wallet/add")
    public ResponseEntity<ApiResponse<WalletTransactionDTO>> addToWallet(
            @Valid @RequestBody AddToWalletRequest request,
            @RequestHeader("X-User-ID") UUID userId) {

        log.info("Add money to wallet for user: {}", userId);
        WalletTransactionDTO transaction = paymentService.addToWallet(userId, request);
        return success(transaction, "Money added to wallet");
    }

    @Operation(summary = "Get wallet transactions")
    @GetMapping("/wallet/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransactionDTO>>> getWalletTransactions(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Get wallet transactions for user: {}", userId);
        List<WalletTransactionDTO> transactions = paymentService.getWalletTransactions(userId, page, size);
        return success(transactions);
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Payment details")
    public static class PaymentDTO {
        private UUID paymentId;
        private UUID orderId;
        private UUID userId;
        private String status;
        private String method;
        private String gateway;
        private String gatewayTransactionId;
        private BigDecimal amount;
        private BigDecimal amountPaid;
        private BigDecimal amountDue;
        private String currency;
        private String statusMessage;
        private String errorCode;
        private String errorMessage;
        private java.time.Instant initiatedAt;
        private java.time.Instant processedAt;
        private java.time.Instant expiresAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Initiate payment request")
    public static class InitiatePaymentRequest {
        @Schema(description = "Order ID")
        private UUID orderId;
        
        @Schema(description = "Payment method", example = "CARD, UPI, NET_BANKING, WALLET")
        private String method;
        
        @Schema(description = "Card ID (for saved cards)")
        private UUID cardId;
        
        @Schema(description = "Save card for future")
        private Boolean saveCard;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Payment initiation response")
    public static class PaymentInitiationDTO {
        private UUID paymentId;
        private String status;
        private String gateway;
        private String redirectUrl;
        private String transactionId;
        private String qrCodeUrl;
        private String upiId;
        private BigDecimal amount;
        private java.time.Instant expiresAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Confirm payment request")
    public static class ConfirmPaymentRequest {
        private String gatewayTransactionId;
        private String paymentProof;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Refund details")
    public static class RefundDTO {
        private UUID refundId;
        private UUID paymentId;
        private UUID orderId;
        private UUID userId;
        private String status;
        private BigDecimal amount;
        private BigDecimal amountRefunded;
        private String reason;
        private String refundMethod;
        private String gatewayRefundId;
        private java.time.LocalDateTime requestedAt;
        private java.time.LocalDateTime processedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Refund request")
    public static class RefundRequest {
        private UUID orderId;
        private UUID orderItemId;
        private BigDecimal amount;
        private String reason;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Wallet details")
    public static class WalletDTO {
        private UUID userId;
        private BigDecimal balance;
        private BigDecimal pendingBalance;
        private BigDecimal totalSpent;
        private BigDecimal totalEarned;
        private Integer transactionsCount;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Add to wallet request")
    public static class AddToWalletRequest {
        @Schema(description = "Amount to add")
        private BigDecimal amount;
        
        @Schema(description = "Payment method")
        private String method;
        
        @Schema(description = "Source transaction ID")
        private String sourceTransactionId;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Wallet transaction")
    public static class WalletTransactionDTO {
        private UUID transactionId;
        private UUID userId;
        private String type;
        private BigDecimal amount;
        private BigDecimal balanceBefore;
        private BigDecimal balanceAfter;
        private String status;
        private String description;
        private String reference;
        private java.time.Instant createdAt;
    }
}
