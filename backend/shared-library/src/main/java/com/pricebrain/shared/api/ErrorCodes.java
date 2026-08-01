package com.pricebrain.shared.api;

import lombok.Getter;

/**
 * Standardized error codes for PriceBrain API.
 */
@Getter
public enum ErrorCodes {

    // ========== Authentication Errors (AUTH_XXX) ==========
    AUTH_001("AUTH_001", "Invalid credentials", 401),
    AUTH_002("AUTH_002", "Account locked", 401),
    AUTH_003("AUTH_003", "Account suspended", 403),
    AUTH_004("AUTH_004", "Email not verified", 401),
    AUTH_005("AUTH_005", "Token expired", 401),
    AUTH_006("AUTH_006", "Token invalid", 401),
    AUTH_007("AUTH_007", "Refresh token expired", 401),
    AUTH_008("AUTH_008", "Refresh token revoked", 401),
    AUTH_009("AUTH_009", "MFA required", 401),
    AUTH_010("AUTH_010", "MFA invalid", 401),
    AUTH_011("AUTH_011", "Password reset expired", 400),
    AUTH_012("AUTH_012", "Password reset invalid", 400),
    AUTH_013("AUTH_013", "Email already exists", 409),
    AUTH_014("AUTH_014", "Invalid password", 400),
    AUTH_015("AUTH_015", "Account not found", 404),

    // ========== Authorization Errors (AUTHZ_XXX) ==========
    AUTHZ_001("AUTHZ_001", "Access denied", 403),
    AUTHZ_002("AUTHZ_002", "Insufficient permissions", 403),
    AUTHZ_003("AUTHZ_003", "Role not allowed", 403),
    AUTHZ_004("AUTHZ_004", "Resource not owned by user", 403),

    // ========== User Errors (USER_XXX) ==========
    USER_001("USER_001", "User not found", 404),
    USER_002("USER_002", "Profile not found", 404),
    USER_003("USER_003", "Invalid date of birth", 400),
    USER_004("USER_004", "Address not found", 404),
    USER_005("USER_005", "Invalid address", 400),
    USER_006("USER_006", "Preference not found", 404),
    USER_007("USER_007", "Invalid preference value", 400),
    USER_008("USER_008", "Email already verified", 400),
    USER_009("USER_009", "Phone already verified", 400),

    // ========== Seller Errors (SELLER_XXX) ==========
    SELLER_001("SELLER_001", "Seller not found", 404),
    SELLER_002("SELLER_002", "Store slug already exists", 409),
    SELLER_003("SELLER_003", "KYC not found", 404),
    SELLER_004("SELLER_004", "KYC verification pending", 400),
    SELLER_005("SELLER_005", "KYC verification rejected", 400),
    SELLER_006("SELLER_006", "Seller account suspended", 403),
    SELLER_007("SELLER_007", "Seller not approved", 400),
    SELLER_008("SELLER_008", "Invalid business type", 400),
    SELLER_009("SELLER_009", "Invalid GSTIN", 400),
    SELLER_010("SELLER_010", "Invalid PAN number", 400),

    // ========== Product Errors (PROD_XXX) ==========
    PROD_001("PROD_001", "Product not found", 404),
    PROD_002("PROD_002", "Product slug already exists", 409),
    PROD_003("PROD_003", "Category not found", 404),
    PROD_004("PROD_004", "Brand not found", 404),
    PROD_005("PROD_005", "Invalid price range", 400),
    PROD_006("PROD_006", "Product not active", 400),
    PROD_007("PROD_007", "Product out of stock", 400),
    PROD_008("PROD_008", "Stock insufficient", 400),
    PROD_009("PROD_009", "Variant not found", 404),
    PROD_010("PROD_010", "SKU already exists", 409),
    PROD_011("PROD_011", "Invalid product status", 400),
    PROD_012("PROD_012", "Product under review", 400),

    // ========== Order Errors (ORDER_XXX) ==========
    ORDER_001("ORDER_001", "Order not found", 404),
    ORDER_002("ORDER_002", "Order number already exists", 409),
    ORDER_003("ORDER_003", "Invalid order status", 400),
    ORDER_004("ORDER_004", "Order already cancelled", 400),
    ORDER_005("ORDER_005", "Order already delivered", 400),
    ORDER_006("ORDER_006", "Order cannot be cancelled", 400),
    ORDER_007("ORDER_007", "Order item not found", 404),
    ORDER_008("ORDER_008", "Shipment not found", 404),
    ORDER_009("ORDER_009", "Return request not found", 404),
    ORDER_010("ORDER_010", "Return already requested", 400),
    ORDER_011("ORDER_011", "Return window expired", 400),
    ORDER_012("ORDER_012", "Invalid return reason", 400),
    ORDER_013("ORDER_013", "Order total mismatch", 400),

    // ========== Cart Errors (CART_XXX) ==========
    CART_001("CART_001", "Cart not found", 404),
    CART_002("CART_002", "Cart empty", 400),
    CART_003("CART_003", "Cart item not found", 404),
    CART_004("CART_004", "Product not in cart", 400),
    CART_005("CART_005", "Invalid quantity", 400),
    CART_006("CART_006", "Quantity exceeds stock", 400),
    CART_007("CART_007", "Cart expired", 400),

    // ========== Wishlist Errors (WISHLIST_XXX) ==========
    WISHLIST_001("WISHLIST_001", "Wishlist not found", 404),
    WISHLIST_002("WISHLIST_002", "Item already in wishlist", 409),
    WISHLIST_003("WISHLIST_003", "Wishlist item not found", 404),
    WISHLIST_004("WISHLIST_004", "Wishlist share limit reached", 400),
    WISHLIST_005("WISHLIST_005", "Invalid share token", 400),

    // ========== Payment Errors (PAY_XXX) ==========
    PAY_001("PAY_001", "Payment not found", 404),
    PAY_002("PAY_002", "Payment failed", 400),
    PAY_003("PAY_003", "Payment pending", 400),
    PAY_004("PAY_004", "Payment already processed", 400),
    PAY_005("PAY_005", "Invalid payment method", 400),
    PAY_006("PAY_006", "Insufficient wallet balance", 400),
    PAY_007("PAY_007", "Refund not allowed", 400),
    PAY_008("PAY_008", "Refund amount exceeds paid", 400),
    PAY_009("PAY_009", "Payment gateway error", 502),
    PAY_010("PAY_010", "Transaction timeout", 504),

    // ========== Review Errors (REVIEW_XXX) ==========
    REVIEW_001("REVIEW_001", "Review not found", 404),
    REVIEW_002("REVIEW_002", "Review already exists", 409),
    REVIEW_003("REVIEW_003", "Not a verified purchaser", 403),
    REVIEW_004("REVIEW_004", "Rating out of range", 400),
    REVIEW_005("REVIEW_005", "Review flagged", 400),
    REVIEW_006("REVIEW_006", "Review rejected", 400),
    REVIEW_007("REVIEW_007", "Self-review not allowed", 400),

    // ========== Coupon Errors (COUPON_XXX) ==========
    COUPON_001("COUPON_001", "Coupon not found", 404),
    COUPON_002("COUPON_002", "Coupon expired", 400),
    COUPON_003("COUPON_003", "Coupon not started", 400),
    COUPON_004("COUPON_004", "Coupon usage limit reached", 400),
    COUPON_005("COUPON_005", "Minimum purchase not met", 400),
    COUPON_006("COUPON_006", "Coupon already used", 400),
    COUPON_007("COUPON_007", "Coupon not applicable to cart", 400),

    // ========== Notification Errors (NOTIF_XXX) ==========
    NOTIF_001("NOTIF_001", "Notification not found", 404),
    NOTIF_002("NOTIF_002", "Invalid notification type", 400),
    NOTIF_003("NOTIF_003", "Notification preference not found", 404),

    // ========== AI Errors (AI_XXX) ==========
    AI_001("AI_001", "AI service unavailable", 503),
    AI_002("AI_002", "AI request timeout", 504),
    AI_003("AI_003", "AI model not found", 404),
    AI_004("AI_004", "AI conversation not found", 404),
    AI_005("AI_005", "AI mission not found", 404),
    AI_006("AI_006", "AI mission already completed", 400),
    AI_007("AI_007", "Invalid AI request", 400),
    AI_008("AI_008", "AI content filter triggered", 400),

    // ========== Search Errors (SEARCH_XXX) ==========
    SEARCH_001("SEARCH_001", "Search service unavailable", 503),
    SEARCH_002("SEARCH_002", "Invalid search query", 400),
    SEARCH_003("SEARCH_003", "Search timeout", 504),
    SEARCH_004("SEARCH_004", "No results found", 404),

    // ========== Validation Errors (VAL_XXX) ==========
    VAL_001("VAL_001", "Validation failed", 400),
    VAL_002("VAL_002", "Invalid request body", 400),
    VAL_003("VAL_003", "Missing required field", 400),
    VAL_004("VAL_004", "Invalid field format", 400),
    VAL_005("VAL_005", "Field too long", 400),
    VAL_006("VAL_006", "Field too short", 400),
    VAL_007("VAL_007", "Invalid enum value", 400),

    // ========== Rate Limiting (RATE_XXX) ==========
    RATE_001("RATE_001", "Rate limit exceeded", 429),
    RATE_002("RATE_002", "Too many requests", 429),

    // ========== Server Errors (SYS_XXX) ==========
    SYS_001("SYS_001", "Internal server error", 500),
    SYS_002("SYS_002", "Service unavailable", 503),
    SYS_003("SYS_003", "Database error", 500),
    SYS_004("SYS_004", "Cache error", 500),
    SYS_005("SYS_005", "External service error", 502),
    SYS_006("SYS_006", "Configuration error", 500),
    SYS_007("SYS_007", "Message queue error", 500),

    // ========== Generic Errors (GEN_XXX) ==========
    GEN_001("GEN_001", "Resource not found", 404),
    GEN_002("GEN_002", "Conflict", 409),
    GEN_003("GEN_003", "Gone", 410),
    GEN_004("GEN_004", "Unsupported media type", 415),
    GEN_005("GEN_005", "Not implemented", 501),
    GEN_006("GEN_006", "Method not allowed", 405);

    private final String code;
    private final String defaultMessage;
    private final int httpStatus;

    ErrorCodes(String code, String defaultMessage, int httpStatus) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.httpStatus = httpStatus;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public ApiResponse.ErrorDetails toErrorDetails() {
        return ApiResponse.ErrorDetails.builder()
                .code(this.code)
                .message(this.defaultMessage)
                .build();
    }

    public ApiResponse.ErrorDetails toErrorDetails(String details) {
        return ApiResponse.ErrorDetails.builder()
                .code(this.code)
                .message(this.defaultMessage)
                .details(details)
                .build();
    }
}
