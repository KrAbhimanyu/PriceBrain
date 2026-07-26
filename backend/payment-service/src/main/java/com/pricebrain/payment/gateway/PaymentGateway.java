package com.pricebrain.payment.gateway;

import com.pricebrain.payment.controller.PaymentController.PaymentInitiationDTO;
import com.pricebrain.shared.model.Payment;
import java.math.BigDecimal;

/**
 * Payment gateway interface for integrating with payment providers.
 */
public interface PaymentGateway {

    /**
     * Get gateway name.
     */
    String getName();

    /**
     * Initiate payment with gateway.
     */
    PaymentInitiationDTO initiate(Payment payment);

    /**
     * Verify payment with gateway.
     */
    boolean verify(String transactionId);

    /**
     * Process refund.
     */
    boolean refund(String transactionId, BigDecimal amount);

    /**
     * Get payment status from gateway.
     */
    String getStatus(String transactionId);

    /**
     * Cancel payment.
     */
    boolean cancel(String transactionId);
}
