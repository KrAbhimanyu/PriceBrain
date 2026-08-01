-- V1__Initial_Schema.sql
-- PriceBrain Initial Database Schema
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS SCHEMA (Authentication & Profiles)
-- ============================================

-- Users table (extends BaseEntity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SELLER', 'BUYER', 'AI_AGENT', 'INTERNAL_SERVICE')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    is_locked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_locked ON users(is_locked) WHERE is_locked = TRUE;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_refresh ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_token ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verification_token ON email_verification_tokens(token_hash);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_image_url VARCHAR(500),
    bio TEXT,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    sms_subscribed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('HOME', 'WORK', 'OTHER')),
    is_default BOOLEAN DEFAULT FALSE,
    recipient_name VARCHAR(200),
    phone VARCHAR(20),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default) WHERE is_default = TRUE;

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    price_alerts BOOLEAN DEFAULT TRUE,
    order_updates BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    correlation_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- SELLER SCHEMA
-- ============================================

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(200) NOT NULL,
    store_slug VARCHAR(200) UNIQUE NOT NULL,
    store_description TEXT,
    store_logo_url VARCHAR(500),
    store_banner_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'SUSPENDED', 'REJECTED')),
    seller_type VARCHAR(20) DEFAULT 'INDIVIDUAL' CHECK (seller_type IN ('INDIVIDUAL', 'BUSINESS', 'ENTERPRISE')),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    rejection_reason TEXT,
    total_products INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    ai_business_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sellers_user ON sellers(user_id);
CREATE INDEX idx_sellers_slug ON sellers(store_slug);
CREATE INDEX idx_sellers_status ON sellers(status);

-- Seller KYC
CREATE TABLE IF NOT EXISTS seller_kyc (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID UNIQUE NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    business_name VARCHAR(200),
    business_type VARCHAR(50),
    gstin VARCHAR(15),
    pan_number VARCHAR(10),
    pan_card_url VARCHAR(500),
    bank_name VARCHAR(200),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    bank_account_holder VARCHAR(200),
    cancelled_cheque_url VARCHAR(500),
    address_proof_url VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seller_kyc_seller ON seller_kyc(seller_id);

-- Seller settlements
CREATE TABLE IF NOT EXISTS seller_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_amount DECIMAL(15, 2) NOT NULL,
    commission_amount DECIMAL(15, 2) NOT NULL,
    refund_amount DECIMAL(15, 2) DEFAULT 0,
    penalty_amount DECIMAL(15, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    transaction_id VARCHAR(100),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seller_settlements_seller ON seller_settlements(seller_id);
CREATE INDEX idx_seller_settlements_period ON seller_settlements(period_start, period_end);
CREATE INDEX idx_seller_settlements_status ON seller_settlements(status);

-- ============================================
-- PRODUCT SCHEMA
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    image_url VARCHAR(500),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 0,
    path VARCHAR(255),
    product_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version BIGINT DEFAULT 0,
    is_active_base BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    website_url VARCHAR(500),
    country_of_origin VARCHAR(100),
    product_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version BIGINT DEFAULT 0,
    is_active_base BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_active ON brands(is_active) WHERE is_active = TRUE;

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    highlights TEXT[],
    specification JSONB,
    tags TEXT[],
    mrp DECIMAL(10, 2),
    selling_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED')),
    ai_quality_score INTEGER,
    ai_seo_score INTEGER,
    ai_description TEXT,
    view_count INTEGER DEFAULT 0,
    wishlist_count INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    return_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(selling_price);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

-- Product variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    mrp DECIMAL(10, 2),
    selling_price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_variant ON product_images(variant_id);

-- Product attributes
CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_attribute_id UUID,
    name VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    unit VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_highlight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);

-- Category attributes
CREATE TABLE IF NOT EXISTS category_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    data_type VARCHAR(20) DEFAULT 'TEXT' CHECK (data_type IN ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT')),
    allowed_values TEXT[],
    is_required BOOLEAN DEFAULT FALSE,
    is_filterable BOOLEAN DEFAULT FALSE,
    is_searchable BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category_attributes_category ON category_attributes(category_id);

-- ============================================
-- ORDER SCHEMA
-- ============================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED')),
    items_count INTEGER DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    coupon_id UUID,
    coupon_code VARCHAR(50),
    shipping_charge DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    shipping_address_id UUID,
    billing_address_id UUID,
    payment_method VARCHAR(30),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    ai_recommendation_used BOOLEAN DEFAULT FALSE,
    ai_recommended_products UUID[],
    estimated_delivery DATE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_payment ON orders(payment_status);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES sellers(id) ON DELETE RESTRICT,
    sku VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    taxable_amount DECIMAL(12, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    seller_commission DECIMAL(10, 2),
    seller_payout DECIMAL(10, 2),
    item_status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (item_status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    tracking_number VARCHAR(100),
    carrier VARCHAR(50),
    shipping_method VARCHAR(50),
    shipping_cost DECIMAL(10, 2),
    weight_kg DECIMAL(8, 3),
    status VARCHAR(30) DEFAULT 'LABEL_GENERATED' CHECK (status IN ('LABEL_GENERATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'EXCEPTION')),
    shipped_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);

-- Order returns
CREATE TABLE IF NOT EXISTS order_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    reason VARCHAR(50) NOT NULL,
    reason_description TEXT,
    return_status VARCHAR(20) DEFAULT 'REQUESTED' CHECK (return_status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'RECEIVED', 'REFUND_INITIATED', 'COMPLETED')),
    refund_amount DECIMAL(12, 2),
    refund_method VARCHAR(20),
    pickup_date DATE,
    pickup_address_id UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_returns_order ON order_returns(order_id);
CREATE INDEX idx_order_returns_status ON order_returns(return_status);

-- ============================================
-- CART & WISHLIST SCHEMA
-- ============================================

-- Carts
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    is_guest BOOLEAN DEFAULT FALSE,
    subtotal DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    coupon_id UUID,
    coupon_code VARCHAR(50),
    ai_suggestions JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    is_saved BOOLEAN DEFAULT FALSE,
    ai_recommended BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'My Wishlist',
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_share ON wishlists(share_token);

-- Wishlist items
CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    target_price DECIMAL(10, 2),
    price_alert_enabled BOOLEAN DEFAULT TRUE,
    notify_on_discount BOOLEAN DEFAULT TRUE,
    note TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wishlist_id, product_id)
);

CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product ON wishlist_items(product_id);

-- ============================================
-- REVIEW SCHEMA
-- ============================================

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    content TEXT,
    pros TEXT[],
    cons TEXT[],
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_sentiment VARCHAR(20),
    ai_confidence DECIMAL(5, 4),
    helpful_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED')),
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Review images
CREATE TABLE IF NOT EXISTS review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_images_review ON review_images(review_id);

-- Review helpful votes
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id)
);

-- ============================================
-- PAYMENT SCHEMA
-- ============================================

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(30) NOT NULL,
    payment_provider VARCHAR(30),
    provider_transaction_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    gateway_response JSONB,
    refund_amount DECIMAL(12, 2) DEFAULT 0,
    refunded_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_txn ON payments(provider_transaction_id);

-- User wallets
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(12, 2) DEFAULT 0,
    pending_balance DECIMAL(12, 2) DEFAULT 0,
    lifetime_earned DECIMAL(12, 2) DEFAULT 0,
    lifetime_spent DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('CREDIT', 'DEBIT')),
    amount DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    reference_type VARCHAR(30),
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);

-- ============================================
-- COUPON SCHEMA
-- ============================================

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED', 'FREE_SHIPPING')),
    value DECIMAL(10, 2) NOT NULL,
    min_purchase DECIMAL(10, 2),
    max_discount DECIMAL(10, 2),
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    starts_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_categories UUID[],
    applicable_products UUID[],
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_dates ON coupons(starts_at, expires_at);

-- Coupon usage
CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(coupon_id, order_id)
);

CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user ON coupon_usages(user_id);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name, slug, icon, sort_order, level) VALUES
    ('Electronics', 'electronics', 'laptop', 1, 0),
    ('Fashion', 'fashion', 'shirt', 2, 0),
    ('Home & Kitchen', 'home-kitchen', 'home', 3, 0),
    ('Beauty & Personal Care', 'beauty', 'sparkles', 4, 0),
    ('Sports & Fitness', 'sports', 'dumbbell', 5, 0),
    ('Books', 'books', 'book-open', 6, 0),
    ('Toys & Games', 'toys', 'gamepad-2', 7, 0),
    ('Food & Grocery', 'food', 'shopping-cart', 8, 0)
ON CONFLICT (slug) DO NOTHING;

-- Insert default admin user (password: Admin@123)
INSERT INTO users (email, password_hash, role, is_email_verified, is_active) VALUES
    ('admin@pricebrain.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKXlHXw1u', 'SUPER_ADMIN', true, true)
ON CONFLICT (email) DO NOTHING;
