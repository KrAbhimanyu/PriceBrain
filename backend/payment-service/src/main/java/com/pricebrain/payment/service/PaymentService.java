package com.pricebrain.payment.service;

import com.pricebrain.payment.controller.PaymentController.*;
import com.pricebrain.payment.dto.PaymentDTOs.*;
import com.pricebrain.payment.gateway.PaymentGateway;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.Payment;
import com.pricebrain.shared.model.Payment.PaymentStatus;
import com.pricebrain.shared.model.Payment.PaymentMethod;
import com.pricebrain.shared.model.Refund;
import com.pricebrain.shared.model.Refund.RefundStatus;
import com.pricebrain.shared.model.Wallet;
import com.pricebrain.shared.model.WalletTransaction;
import com.pricebrain.shared.model.WalletTransaction.TransactionType;
import com.pricebrain.shared.repository.PaymentRepository;
import com.pricebrain.shared.repository.RefundRepository;
import com.pricebrain.shared.repository.WalletRepository;
import com.pricebrain.shared.repository.WalletTransactionRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Payment service implementing business logic for payment operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final PaymentGateway paymentGateway;
    private final RedisService redisService;

    // ==================== PAYMENTS ====================

    /**
     * Get payment by ID.
     */
    @Transactional(readOnly = true)
    public PaymentDTO getPayment(UUID paymentId, UUID userId) {
        log.info("Getting payment: {} for user: {}", paymentId, userId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException(ErrorCodes.PAY_001));

        // Verify ownership
        if (!payment.getUserId().equals(userId)) {
            throw new PaymentException(ErrorCodes.AUTHZ_004);
        }

        return toPaymentDTO(payment);
    }

    /**
     * Get payment by order ID.
     */
    @Transactional(readOnly = true)
    public PaymentDTO getPaymentByOrderId(UUID orderId, UUID userId) {
        log.info("Getting payment for order: {}", orderId);

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentException(ErrorCodes.PAY_001));

        if (!payment.getUserId().equals(userId)) {
            throw new PaymentException(ErrorCodes.AUTHZ_004);
        }

        return toPaymentDTO(payment);
    }

    /**
     * Initiate payment.
     */
    @Transactional
    public PaymentInitiationDTO initiatePayment(UUID userId, InitiatePaymentRequest request) {
        log.info("Initiating payment for user: {}, order: {}", userId, request.getOrderId());

        // Create payment record
        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .userId(userId)
                .method(PaymentMethod.valueOf(request.getMethod()))
                .status(PaymentStatus.PENDING)
                .gateway("RAZORPAY") // TODO: Select gateway based on method
                .amount(BigDecimal.valueOf(1000.00)) // TODO: Get from order
                .amountPaid(BigDecimal.ZERO)
                .amountDue(BigDecimal.valueOf(1000.00))
                .currency("INR")
                .expiresAt(Instant.now().plusSeconds(1800)) // 30 minutes
                .build();

        payment = paymentRepository.save(payment);

        // Initiate with payment gateway
        PaymentInitiationDTO result = paymentGateway.initiate(payment);

        // Update payment with gateway transaction ID
        payment.setGatewayTransactionId(result.getTransactionId());
        paymentRepository.save(payment);

        log.info("Payment initiated: {}", payment.getId());
        return result;
    }

    /**
     * Confirm payment.
     */
    @Transactional
    public PaymentDTO confirmPayment(UUID paymentId, ConfirmPaymentRequest request) {
        log.info("Confirming payment: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException(ErrorCodes.PAY_001));

        // Verify with gateway
        boolean verified = paymentGateway.verify(payment.getGatewayTransactionId());

        if (verified) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setAmountPaid(payment.getAmount());
            payment.setAmountDue(BigDecimal.ZERO);
            payment.setProcessedAt(Instant.now());
            payment = paymentRepository.save(payment);

            // TODO: Publish payment success event
            log.info("Payment confirmed: {}", paymentId);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorMessage("Payment verification failed");
            paymentRepository.save(payment);
            log.warn("Payment verification failed: {}", paymentId);
        }

        return toPaymentDTO(payment);
    }

    /**
     * Cancel payment.
     */
    @Transactional
    public PaymentDTO cancelPayment(UUID paymentId, UUID userId) {
        log.info("Cancelling payment: {} for user: {}", paymentId, userId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException(ErrorCodes.PAY_001));

        if (!payment.getUserId().equals(userId)) {
            throw new PaymentException(ErrorCodes.AUTHZ_004);
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new PaymentException(ErrorCodes.PAY_004);
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setProcessedAt(Instant.now());
        payment = paymentRepository.save(payment);

        log.info("Payment cancelled: {}", paymentId);
        return toPaymentDTO(payment);
    }

    // ==================== REFUNDS ====================

    /**
     * Get refunds for order.
     */
    @Transactional(readOnly = true)
    public List<RefundDTO> getRefundsForOrder(UUID orderId, UUID userId) {
        log.info("Getting refunds for order: {}", orderId);

        List<Refund> refunds = refundRepository.findByOrderId(orderId);

        return refunds.stream()
                .map(this::toRefundDTO)
                .toList();
    }

    /**
     * Request refund.
     */
    @Transactional
    public RefundDTO requestRefund(UUID userId, RefundRequest request) {
        log.info("Refund request for user: {}, order: {}", userId, request.getOrderId());

        // Get payment
        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new PaymentException(ErrorCodes.PAY_001));

        if (!payment.getUserId().equals(userId)) {
            throw new PaymentException(ErrorCodes.AUTHZ_004);
        }

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new PaymentException(ErrorCodes.PAY_007);
        }

        // Create refund request
        Refund refund = Refund.builder()
                .paymentId(payment.getId())
                .orderId(request.getOrderId())
                .orderItemId(request.getOrderItemId())
                .userId(userId)
                .status(RefundStatus.PENDING)
                .amount(request.getAmount())
                .amountRefunded(BigDecimal.ZERO)
                .reason(request.getReason())
                .build();

        refund = refundRepository.save(refund);

        log.info("Refund requested: {}", refund.getId());
        return toRefundDTO(refund);
    }

    /**
     * Get refund status.
     */
    @Transactional(readOnly = true)
    public RefundDTO getRefundStatus(UUID refundId, UUID userId) {
        log.info("Getting refund status: {}", refundId);

        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new PaymentException(ErrorCodes.PAY_007));

        if (!refund.getUserId().equals(userId)) {
            throw new PaymentException(ErrorCodes.AUTHZ_004);
        }

        return toRefundDTO(refund);
    }

    // ==================== WALLET ====================

    /**
     * Get wallet.
     */
    @Transactional(readOnly = true)
    public WalletDTO getWallet(UUID userId) {
        log.info("Getting wallet for user: {}", userId);

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));

        return WalletDTO.builder()
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .pendingBalance(wallet.getPendingBalance())
                .totalSpent(wallet.getTotalSpent())
                .totalEarned(wallet.getTotalEarned())
                .transactionsCount(walletTransactionRepository.countByUserId(userId).intValue())
                .build();
    }

    /**
     * Add money to wallet.
     */
    @Transactional
    public WalletTransactionDTO addToWallet(UUID userId, AddToWalletRequest request) {
        log.info("Adding money to wallet for user: {}", userId);

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));

        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal newBalance = wallet.getBalance().add(request.getAmount());

        wallet.setBalance(newBalance);
        wallet.setTotalEarned(wallet.getTotalEarned().add(request.getAmount()));
        walletRepository.save(wallet);

        // Create transaction
        WalletTransaction transaction = WalletTransaction.builder()
                .userId(userId)
                .type(TransactionType.CREDIT)
                .amount(request.getAmount())
                .balanceBefore(balanceBefore)
                .balanceAfter(newBalance)
                .status("COMPLETED")
                .description("Wallet top-up")
                .reference(request.getSourceTransactionId())
                .build();

        transaction = walletTransactionRepository.save(transaction);

        log.info("Added to wallet for user: {}, amount: {}", userId, request.getAmount());

        return toWalletTransactionDTO(transaction);
    }

    /**
     * Get wallet transactions.
     */
    @Transactional(readOnly = true)
    public List<WalletTransactionDTO> getWalletTransactions(UUID userId, int page, int size) {
        log.info("Getting wallet transactions for user: {}", userId);

        List<WalletTransaction> transactions = 
                walletTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return transactions.stream()
                .map(this::toWalletTransactionDTO)
                .toList();
    }

    // ==================== HELPERS ====================

    /**
     * Create new wallet for user.
     */
    private Wallet createWallet(UUID userId) {
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .balance(BigDecimal.ZERO)
                .pendingBalance(BigDecimal.ZERO)
                .totalSpent(BigDecimal.ZERO)
                .totalEarned(BigDecimal.ZERO)
                .isActive(true)
                .build();

        return walletRepository.save(wallet);
    }

    /**
     * Convert Payment to DTO.
     */
    private PaymentDTO toPaymentDTO(Payment payment) {
        return PaymentDTO.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .status(payment.getStatus().name())
                .method(payment.getMethod().name())
                .gateway(payment.getGateway())
                .gatewayTransactionId(payment.getGatewayTransactionId())
                .amount(payment.getAmount())
                .amountPaid(payment.getAmountPaid())
                .amountDue(payment.getAmountDue())
                .currency(payment.getCurrency())
                .statusMessage(payment.getStatusMessage())
                .errorCode(payment.getErrorCode())
                .errorMessage(payment.getErrorMessage())
                .initiatedAt(payment.getCreatedAt())
                .processedAt(payment.getProcessedAt())
                .expiresAt(payment.getExpiresAt())
                .build();
    }

    /**
     * Convert Refund to DTO.
     */
    private RefundDTO toRefundDTO(Refund refund) {
        return RefundDTO.builder()
                .refundId(refund.getId())
                .paymentId(refund.getPaymentId())
                .orderId(refund.getOrderId())
                .userId(refund.getUserId())
                .status(refund.getStatus().name())
                .amount(refund.getAmount())
                .amountRefunded(refund.getAmountRefunded())
                .reason(refund.getReason())
                .refundMethod(refund.getRefundMethod())
                .gatewayRefundId(refund.getGatewayRefundId())
                .requestedAt(refund.getCreatedAt())
                .processedAt(refund.getProcessedAt())
                .build();
    }

    /**
     * Convert WalletTransaction to DTO.
     */
    private WalletTransactionDTO toWalletTransactionDTO(WalletTransaction transaction) {
        return WalletTransactionDTO.builder()
                .transactionId(transaction.getId())
                .userId(transaction.getUserId())
                .type(transaction.getType().name())
                .amount(transaction.getAmount())
                .balanceBefore(transaction.getBalanceBefore())
                .balanceAfter(transaction.getBalanceAfter())
                .status(transaction.getStatus())
                .description(transaction.getDescription())
                .reference(transaction.getReference())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    /**
     * Custom payment exception.
     */
    public static class PaymentException extends RuntimeException {
        private final ErrorCodes errorCode;

        public PaymentException(ErrorCodes errorCode) {
            super(errorCode.getDefaultMessage());
            this.errorCode = errorCode;
        }

        public ErrorCodes getErrorCode() {
            return errorCode;
        }
    }
}
