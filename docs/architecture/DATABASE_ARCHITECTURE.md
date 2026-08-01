# PriceBrain Database Architecture

## Overview

This document describes the complete database architecture for PriceBrain AI Marketplace.

## Database Strategy

| Database | Type | Purpose |
|----------|------|---------|
| `pricebrain_auth` | PostgreSQL | Authentication, Users, Sessions |
| `pricebrain_users` | PostgreSQL | User Profiles, Addresses, Preferences |
| `pricebrain_sellers` | PostgreSQL | Seller Profiles, KYC, Settlements |
| `pricebrain_products` | PostgreSQL | Products, Categories, Brands |
| `pricebrain_inventory` | PostgreSQL | Warehouses, Stock Levels |
| `pricebrain_orders` | PostgreSQL | Orders, Order Items, Shipping |
| `pricebrain_payments` | PostgreSQL | Transactions, Wallets |
| `pricebrain_reviews` | PostgreSQL | Reviews, Ratings |
| `pricebrain_notifications` | MongoDB | Notifications, Templates |
| `pricebrain_ai` | MongoDB | AI Memory, Conversations |
| `pricebrain_analytics` | MongoDB | Analytics Events, Reports |
| `pricebrain_knowledge` | Neo4j | Knowledge Graph |
| `pricebrain_cache` | Redis | Sessions, Cache, Rate Limiting |
| `pricebrain_search` | OpenSearch | Full-Text Search |

---

## 1. Authentication Database (PostgreSQL)

### Schema: `pricebrain_auth`

**Business Purpose:** User authentication, session management, security

#### Tables

##### `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SELLER', 'BUYER', 'AI_AGENT')),
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
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_locked ON users(is_locked) WHERE is_locked = TRUE;
```

##### `sessions`
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
```

##### `email_verification_tokens`
```sql
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_verification_token ON email_verification_tokens(token_hash);
```

##### `audit_logs`
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

## 2. User Database (PostgreSQL)

### Schema: `pricebrain_users`

**Business Purpose:** User profiles, addresses, preferences

#### Tables

##### `user_profiles`
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `addresses`
```sql
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `user_preferences`
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

## 3. Seller Database (PostgreSQL)

### Schema: `pricebrain_sellers`

**Business Purpose:** Seller profiles, KYC, business details, settlements

#### Tables

##### `sellers`
```sql
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sellers_user ON sellers(user_id);
CREATE INDEX idx_sellers_slug ON sellers(store_slug);
CREATE INDEX idx_sellers_status ON sellers(status);
```

##### `seller_kyc`
```sql
CREATE TABLE seller_kyc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `seller_settlements`
```sql
CREATE TABLE seller_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

## 4. Product Database (PostgreSQL)

### Schema: `pricebrain_products`

**Business Purpose:** Product catalog, categories, brands, variants

#### Tables

##### `categories`
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    image_url VARCHAR(500),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 0,
    path LTREE,
    product_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories USING GIST(path);
```

##### `brands`
```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_active ON brands(is_active) WHERE is_active = TRUE;
```

##### `products`
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(selling_price);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
```

##### `product_variants`
```sql
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `product_images`
```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `product_attributes`
```sql
CREATE TABLE product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_attribute_id UUID REFERENCES category_attributes(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    unit VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_highlight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);
```

##### `category_attributes`
```sql
CREATE TABLE category_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

## 5. Order Database (PostgreSQL)

### Schema: `pricebrain_orders`

**Business Purpose:** Orders, order items, shipping, tracking

#### Tables

##### `orders`
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED')),
    items_count INTEGER DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    coupon_id UUID REFERENCES coupons(id),
    coupon_code VARCHAR(50),
    shipping_charge DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    shipping_address_id UUID REFERENCES addresses(id),
    billing_address_id UUID REFERENCES addresses(id),
    payment_method VARCHAR(30),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    ai_recommendation_used BOOLEAN DEFAULT FALSE,
    ai_recommended_products UUID[],
    estimated_delivery DATE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_payment ON orders(payment_status);
```

##### `order_items`
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `shipments`
```sql
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `order_returns`
```sql
CREATE TABLE order_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    reason VARCHAR(50) NOT NULL,
    reason_description TEXT,
    return_status VARCHAR(20) DEFAULT 'REQUESTED' CHECK (return_status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'RECEIVED', 'REFUND_INITIATED', 'COMPLETED')),
    refund_amount DECIMAL(12, 2),
    refund_method VARCHAR(20),
    pickup_date DATE,
    pickup_address_id UUID REFERENCES addresses(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_order_returns_order ON order_returns(order_id);
CREATE INDEX idx_order_returns_status ON order_returns(return_status);
```

---

## 6. Payment Database (PostgreSQL)

### Schema: `pricebrain_payments`

**Business Purpose:** Transactions, payment methods, wallets

#### Tables

##### `payments`
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `user_wallets`
```sql
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

##### `wallet_transactions`
```sql
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

## 7. Review Database (PostgreSQL)

### Schema: `pricebrain_reviews`

**Business Purpose:** Product reviews, ratings

#### Tables

##### `reviews`
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE UNIQUE INDEX idx_reviews_unique ON reviews(user_id, product_id) WHERE status = 'APPROVED';
```

##### `review_images`
```sql
CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_review_images_review ON review_images(review_id);
```

##### `review_helpful_votes`
```sql
CREATE TABLE review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id)
);
```

---

## 8. Cart Database (PostgreSQL)

### Schema: `pricebrain_orders`

**Business Purpose:** Shopping cart, saved carts

#### Tables

##### `carts`
```sql
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    is_guest BOOLEAN DEFAULT FALSE,
    subtotal DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    coupon_id UUID REFERENCES coupons(id),
    coupon_code VARCHAR(50),
    ai_suggestions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);
```

##### `cart_items`
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

## 9. Wishlist Database (PostgreSQL)

### Schema: `pricebrain_users`

**Business Purpose:** Wishlists, saved products

#### Tables

##### `wishlists`
```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'My Wishlist',
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_share ON wishlists(share_token);
```

##### `wishlist_items`
```sql
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE INDEX idx_wishlist_items_price_alert ON wishlist_items(target_price) WHERE price_alert_enabled = TRUE;
```

---

## 10. Notification Database (MongoDB)

### Collection: `notifications`

```javascript
{
    "_id": ObjectId,
    "userId": UUID,
    "type": "ORDER_UPDATE" | "PRICE_DROP" | "WISHLIST_ALERT" | "PROMOTION" | "SYSTEM",
    "title": String,
    "message": String,
    "data": {
        "orderId": UUID,
        "productId": UUID,
        "url": String
    },
    "channels": ["IN_APP", "EMAIL", "SMS", "PUSH"],
    "status": "PENDING" | "SENT" | "READ" | "ARCHIVED",
    "readAt": ISODate,
    "priority": "LOW" | "MEDIUM" | "HIGH",
    "scheduledAt": ISODate,
    "sentAt": ISODate,
    "createdAt": ISODate,
    "updatedAt": ISODate
}
```

### Collection: `notification_templates`

```javascript
{
    "_id": ObjectId,
    "code": String, // e.g., "order_confirmed_email"
    "type": String,
    "channels": ["IN_APP", "EMAIL", "SMS", "PUSH"],
    "subject": String,
    "body": String,
    "variables": [String],
    "isActive": Boolean,
    "createdAt": ISODate,
    "updatedAt": ISODate
}
```

### Collection: `user_notification_preferences`

```javascript
{
    "_id": ObjectId,
    "userId": UUID,
    "channels": {
        "inApp": Boolean,
        "email": Boolean,
        "sms": Boolean,
        "push": Boolean
    },
    "categories": {
        "orderUpdates": Boolean,
        "priceDrops": Boolean,
        "wishlistAlerts": Boolean,
        "promotions": Boolean,
        "recommendations": Boolean
    },
    "quietHours": {
        "enabled": Boolean,
        "start": String, // "22:00"
        "end": String    // "08:00"
    },
    "createdAt": ISODate,
    "updatedAt": ISODate
}
```

---

## 11. AI Memory Database (MongoDB)

### Collection: `conversations`

```javascript
{
    "_id": ObjectId,
    "userId": UUID,
    "sessionId": String,
    "type": "ASK_BRAIN" | "FASHION_STYLIST" | "PRICE_MONITOR",
    "messages": [
        {
            "role": "user" | "assistant" | "system",
            "content": String,
            "attachments": [String],
            "metadata": Object,
            "createdAt": ISODate
        }
    ],
    "context": {
        "currentProducts": [UUID],
        "preferences": Object,
        "conversationHistory": [Object]
    },
    "metadata": {
        "totalTokens": Number,
        "model": String,
        "confidence": Number
    },
    "createdAt": ISODate,
    "updatedAt": ISODate,
    "endedAt": ISODate
}
```

### Collection: `user_preferences_learned`

```javascript
{
    "_id": ObjectId,
    "userId": UUID,
    "category": "shopping" | "brands" | "price" | "style",
    "key": String,
    "value": Mixed,
    "confidence": Number, // 0-1
    "source": "explicit" | "inferred" | "observed",
    "evidence": [Object],
    "lastValidated": ISODate,
    "validUntil": ISODate,
    "createdAt": ISODate,
    "updatedAt": ISODate
}
```

### Collection: `ai_missions`

```javascript
{
    "_id": ObjectId,
    "userId": UUID,
    "type": "PRICE_MONITOR" | "WISHLIST_TRACK" | "STOCK_ALERT",
    "name": String,
    "description": String,
    "status": "ACTIVE" | "PAUSED" | "COMPLETED" | "FAILED",
    "config": Object,
    "results": [Object],
    "lastRunAt": ISODate,
    "nextRunAt": ISODate,
    "completedAt": ISODate,
    "createdAt": ISODate,
    "updatedAt": ISODate
}
```

---

## 12. Knowledge Graph (Neo4j)

### Nodes

```cypher
// User Node
(:User {
    userId: UUID,
    email: String,
    role: String,
    createdAt: DateTime
})

// Product Node  
(:Product {
    productId: UUID,
    name: String,
    slug: String,
    category: String,
    brand: String,
    price: Float,
    rating: Float
})

// Seller Node
(:Seller {
    sellerId: UUID,
    storeName: String,
    slug: String,
    rating: Float,
    totalProducts: Integer
})

// Category Node
(:Category {
    categoryId: UUID,
    name: String,
    slug: String,
    level: Integer
})

// Brand Node
(:Brand {
    brandId: UUID,
    name: String,
    slug: String
})

// Order Node
(:Order {
    orderId: UUID,
    orderNumber: String,
    status: String,
    totalAmount: Float,
    createdAt: DateTime
})
```

### Relationships

```cypher
// User relationships
(u:User)-[:PURCHASED {quantity: 1, totalSpent: 5000}]->(p:Product)
(u:User)-[:WISHLISTED {addedAt: DateTime}]->(p:Product)
(u:User)-[:VIEWED {viewCount: 5, lastViewed: DateTime}]->(p:Product)
(u:User)-[:RATED {rating: 5, reviewId: UUID}]->(p:Product)
(u:User)-[:SEARCHED {query: "laptop", timestamp: DateTime}]->(c:Category)

// Product relationships
(p:Product)-[:BELONGS_TO]->(c:Category)
(p:Product)-[:BRANDED_BY]->(b:Brand)
(p:Product)-[:SOLD_BY {price: 5000, stock: 10}]->(s:Seller)
(p:Product)-[:SIMILAR_TO {similarity: 0.85}]->(other:Product)
(p:Product)-[:OFTEN_BOUGHT_TOGETHER]->(other:Product)

// Seller relationships
(s:Seller)-[:SELLS]->(p:Product)
(s:Seller)-[:LOCATED_IN]->(l:Location)
```

---

## 13. Analytics Database (MongoDB)

### Collection: `events`

```javascript
{
    "_id": ObjectId,
    "eventType": String, // "page_view", "product_view", "add_to_cart", "purchase"
    "userId": UUID,
    "sessionId": String,
    "timestamp": ISODate,
    "properties": {
        "page": String,
        "productId": UUID,
        "categoryId": UUID,
        "searchQuery": String,
        "orderId": UUID,
        "revenue": Number,
        "device": String,
        "browser": String,
        "os": String,
        "location": {
            "country": String,
            "city": String,
            "region": String
        }
    },
    "aiContext": {
        "recommended": Boolean,
        "aiModel": String,
        "confidence": Number
    }
}
```

### Collection: `aggregations`

```javascript
{
    "_id": ObjectId,
    "metricType": String, // "daily_sales", "hourly_conversions"
    "dimensions": {
        "date": ISODate,
        "category": String,
        "seller": UUID,
        "region": String
    },
    "measures": {
        "revenue": Number,
        "orders": Number,
        "visitors": Number,
        "conversions": Number
    },
    "calculatedAt": ISODate
}
```

---

## 14. Cache Strategy (Redis)

### Key Patterns

```
# Sessions
session:{userId} -> Hash
session:{refreshTokenHash} -> String

# User Cache
user:{userId}:profile -> Hash
user:{userId}:cart -> Hash
user:{userId}:wishlist -> Set

# Product Cache
product:{productId} -> Hash (TTL: 1 hour)
product:{productId}:inventory -> String (TTL: 5 min)
category:{categoryId}:products -> Sorted Set (TTL: 30 min)

# Rate Limiting
ratelimit:{ip}:{endpoint} -> String (TTL: 1 min)
ratelimit:{userId}:login -> String (TTL: 1 hour)

# Search Cache
search:{hash} -> JSON (TTL: 15 min)
trending:searches -> Sorted Set (TTL: 24 hours)

# AI Cache
ai:conversation:{sessionId} -> List (TTL: 24 hours)
ai:recommendations:{userId} -> List (TTL: 1 hour)
```

---

## Indexing Strategy

### PostgreSQL Indexes

| Table | Index Type | Columns | Purpose |
|-------|------------|---------|---------|
| users | B-tree | email | Login lookup |
| users | B-tree | role | User filtering |
| products | B-tree | slug | SEO URLs |
| products | B-tree | (category_id, status) | Category browsing |
| products | GIN | to_tsvector(name, description) | Full-text search |
| orders | B-tree | (user_id, created_at) | User order history |
| orders | B-tree | status | Order management |
| reviews | B-tree | (product_id, status) | Product reviews |
| price_history | BRIN | created_at | Time-series queries |

### MongoDB Indexes

| Collection | Index Type | Fields | Purpose |
|------------|------------|--------|---------|
| notifications | Compound | (userId, status, createdAt) | User notifications |
| conversations | Compound | (userId, sessionId) | Conversation lookup |
| events | Time-series | timestamp | Analytics queries |

---

## Data Retention Policy

| Database | Retention | Archive Strategy |
|----------|-----------|-----------------|
| Orders | 7 years | Move to cold storage after 2 years |
| Payments | 7 years | PCI-compliant archive |
| Reviews | Indefinite | Keep all |
| Sessions | 30 days | Delete expired |
| Audit Logs | 3 years | Archive after 1 year |
| Analytics Events | 2 years | Aggregate after 6 months |
| AI Conversations | 90 days | Archive important ones |
| Product Views | 1 year | Aggregate after 30 days |

---

## Backup Strategy

### PostgreSQL
- Daily full backup at 2 AM IST
- WAL archiving every 5 minutes
- Point-in-time recovery enabled
- Cross-region replica for DR

### MongoDB
- Daily snapshots at 3 AM IST
- Oplog retention: 7 days
- Replica set with 3 members
- Cross-region backup to S3

### Redis
- RDB snapshots every hour
- AOF persistence enabled
- Redis Cluster with failover

### Neo4j
- Daily full backup
- Incremental backups every 4 hours
- Online backup enabled

---

## Security

### Encryption
- All databases: TLS 1.3 in transit
- PostgreSQL: AES-256 at rest (AWS RDS encryption)
- MongoDB: WiredTiger encryption at rest
- Redis: TLS for replication

### Access Control
- IAM-based access for cloud services
- Database-specific users per service
- Row-level security for sensitive data
- Audit logging for all DML operations

### Compliance
- PCI DSS Level 1 for payment data
- GDPR compliance for EU users
- SOC 2 Type II certification
