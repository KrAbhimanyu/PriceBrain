package com.pricebrain.shared.model;

/**
 * Enumeration of user roles in the PriceBrain platform.
 */
public enum UserRole {
    /**
     * Super Admin - Full system access
     */
    SUPER_ADMIN,
    
    /**
     * Admin - Administrative access
     */
    ADMIN,
    
    /**
     * Seller - Can list products and manage orders
     */
    SELLER,
    
    /**
     * Buyer - Can browse and purchase products
     */
    BUYER,
    
    /**
     * AI Agent - Automated AI system accounts
     */
    AI_AGENT,
    
    /**
     * Internal Service - Backend service accounts
     */
    INTERNAL_SERVICE
}
