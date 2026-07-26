# PriceBrain API Documentation

## Overview

PriceBrain API is a RESTful API that provides programmatic access to the PriceBrain AI Marketplace platform.

## Base URL

```
Production: https://api.pricebrain.com
Staging: https://staging-api.pricebrain.com
Development: http://localhost:8080
```

## Authentication

All API endpoints (except auth endpoints) require JWT Bearer token authentication.

```bash
curl -H "Authorization: Bearer <your_token>" https://api.pricebrain.com/api/v1/products
```

## API Versioning

All APIs are versioned using URL path prefixing.

```
/api/v1/...  # Version 1
/api/v2/...  # Version 2 (future)
```

## Standard Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <JWT_TOKEN>` |
| `Content-Type` | Yes | `application/json` |
| `X-Correlation-ID` | No | Request tracing ID |
| `X-User-ID` | Yes | Authenticated user ID |
| `X-Idempotency-Key` | No | Prevent duplicate operations |

## Standard Responses

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00Z",
  "correlationId": "uuid-here"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VAL_001",
    "message": "Validation failed",
    "details": "Field 'email' is required",
    "fieldErrors": [
      {
        "field": "email",
        "rejectedValue": null,
        "message": "must not be blank",
        "code": "NotBlank"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "content": [...],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "first": true,
    "last": false,
    "numberOfElements": 20,
    "sort": "createdAt,desc"
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## API Endpoints

### Authentication (Public)

#### Register
```
POST /api/v1/auth/register
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "BUYER"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "role": "BUYER",
    "userId": "uuid"
  }
}
```

#### Login
```
POST /api/v1/auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```
POST /api/v1/auth/refresh
```

#### Forgot Password
```
POST /api/v1/auth/forgot-password
```

#### Reset Password
```
POST /api/v1/auth/reset-password
```

---

### Products

#### List Products
```
GET /api/v1/products
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `categoryId` | UUID | Filter by category |
| `brandId` | UUID | Filter by brand |
| `minPrice` | Decimal | Minimum price |
| `maxPrice` | Decimal | Maximum price |
| `minRating` | Integer | Minimum rating (1-5) |
| `inStock` | Boolean | In stock only |
| `page` | Integer | Page number (0-indexed) |
| `size` | Integer | Page size (max 100) |
| `sortBy` | String | Sort field |
| `sortDir` | String | Sort direction (asc/desc) |

#### Get Product
```
GET /api/v1/products/{id}
```

#### Get Product by Slug
```
GET /api/v1/products/slug/{slug}
```

#### Search Products
```
GET /api/v1/products/search?query=laptop
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | String | Search query (required) |
| `categoryId` | UUID | Category filter |
| `brandId` | UUID | Brand filter |
| `minPrice` | Decimal | Minimum price |
| `maxPrice` | Decimal | Maximum price |
| `page` | Integer | Page number |
| `size` | Integer | Page size |

#### Create Product (Seller)
```
POST /api/v1/products
```

#### Update Product (Seller)
```
PUT /api/v1/products/{id}
```

#### Delete Product (Seller)
```
DELETE /api/v1/products/{id}
```

#### Compare Products
```
GET /api/v1/products/compare?productIds=uuid1,uuid2,uuid3
```

#### Featured Products
```
GET /api/v1/products/featured?limit=20
```

#### Bestsellers
```
GET /api/v1/products/bestsellers?categoryId=uuid&limit=20
```

#### New Arrivals
```
GET /api/v1/products/new-arrivals?categoryId=uuid&limit=20
```

---

### Orders

#### List Orders
```
GET /api/v1/orders
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | String | Order status filter |
| `startDate` | Date | Start date (YYYY-MM-DD) |
| `endDate` | Date | End date (YYYY-MM-DD) |
| `page` | Integer | Page number |
| `size` | Integer | Page size |

#### Get Order
```
GET /api/v1/orders/{orderId}
```

#### Create Order
```
POST /api/v1/orders
```

**Request:**
```json
{
  "shippingAddressId": "uuid",
  "billingAddressId": "uuid",
  "paymentMethod": "CARD",
  "couponCode": "SAVE20",
  "notes": "Leave at door"
}
```

#### Cancel Order
```
POST /api/v1/orders/{orderId}/cancel
```

**Request:**
```json
{
  "reason": "CHANGE_OF_MIND",
  "comment": "Found better price elsewhere"
}
```

#### Request Return
```
POST /api/v1/orders/{orderId}/return
```

**Request:**
```json
{
  "orderItemId": "uuid",
  "reason": "DEFECTIVE",
  "description": "Screen has dead pixels",
  "pickupAddressId": "uuid",
  "pickupDate": "2024-01-20"
}
```

#### Track Shipment
```
GET /api/v1/orders/{orderId}/tracking
```

---

### Cart

#### Get Cart
```
GET /api/v1/cart
```

#### Add to Cart
```
POST /api/v1/cart/items
```

**Request:**
```json
{
  "productId": "uuid",
  "variantId": "uuid",
  "quantity": 2
}
```

#### Update Cart Item
```
PUT /api/v1/cart/items/{itemId}
```

**Request:**
```json
{
  "quantity": 3
}
```

#### Remove from Cart
```
DELETE /api/v1/cart/items/{itemId}
```

#### Clear Cart
```
DELETE /api/v1/cart
```

#### Apply Coupon
```
POST /api/v1/cart/coupon
```

**Request:**
```json
{
  "couponCode": "SAVE20"
}
```

---

### AI Services

#### Ask Brain
```
POST /api/v1/ai/ask
```

**Request:**
```json
{
  "sessionId": "session-uuid",
  "message": "I need a laptop for video editing under 80000 rupees",
  "type": "ASK_BRAIN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Based on your requirements, I recommend...",
    "type": "PRODUCT_RECOMMENDATION",
    "confidence": 0.92,
    "suggestions": [
      {
        "productId": "uuid",
        "name": "MacBook Air M2",
        "reason": "Best for video editing under 80K",
        "price": 79990.00
      }
    ]
  }
}
```

#### Get Recommendations
```
GET /api/v1/ai/recommendations?type=FOR_YOU&limit=10
```

**Recommendation Types:**
- `FOR_YOU` - Personalized for user
- `TRENDING` - Popular products
- `SIMILAR` - Similar to viewed
- `COMPLIMENTARY` - Goes well together
- `REORDER` - Frequently purchased

#### Get Price Prediction
```
GET /api/v1/ai/products/{productId}/price-prediction
```

#### Set Price Alert
```
POST /api/v1/ai/alerts/price
```

**Request:**
```json
{
  "productId": "uuid",
  "targetPrice": 800.00,
  "notifyOnDrop": true,
  "notifyOnIncrease": false
}
```

#### Create AI Mission
```
POST /api/v1/ai/missions
```

**Request:**
```json
{
  "type": "PRICE_MONITOR",
  "name": "Track iPhone price",
  "description": "Monitor iPhone 15 price drops",
  "config": {
    "productId": "uuid",
    "targetPrice": 70000.00,
    "checkIntervalHours": 24
  }
}
```

---

### Wishlist

#### Get Wishlists
```
GET /api/v1/wishlists
```

#### Get Wishlist Items
```
GET /api/v1/wishlists/{wishlistId}/items
```

#### Add to Wishlist
```
POST /api/v1/wishlists/{wishlistId}/items
```

**Request:**
```json
{
  "productId": "uuid",
  "targetPrice": 500.00,
  "note": "Wait for sale"
}
```

#### Remove from Wishlist
```
DELETE /api/v1/wishlists/{wishlistId}/items/{itemId}
```

---

### Categories

#### List Categories
```
GET /api/v1/categories
```

#### Get Category
```
GET /api/v1/categories/{id}
```

#### Get Category Tree
```
GET /api/v1/categories/tree
```

---

### Brands

#### List Brands
```
GET /api/v1/brands
```

#### Get Brand
```
GET /api/v1/brands/{id}
```

---

### Reviews

#### Get Product Reviews
```
GET /api/v1/products/{productId}/reviews
```

#### Create Review
```
POST /api/v1/products/{productId}/reviews
```

**Request:**
```json
{
  "rating": 5,
  "title": "Great product!",
  "content": "The quality exceeded my expectations...",
  "pros": ["Build quality", "Performance"],
  "cons": ["Battery life"]
}
```

#### Mark Review Helpful
```
POST /api/v1/reviews/{reviewId}/helpful
```

---

### Sellers (Seller Role)

#### Get Seller Profile
```
GET /api/v1/sellers/profile
```

#### Update Seller Profile
```
PUT /api/v1/sellers/profile
```

#### Get Seller Orders
```
GET /api/v1/orders/seller
```

#### Get Seller Dashboard
```
GET /api/v1/sellers/dashboard
```

#### Submit KYC
```
POST /api/v1/sellers/kyc
```

---

### Notifications

#### Get Notifications
```
GET /api/v1/notifications
```

#### Mark as Read
```
PUT /api/v1/notifications/{notificationId}/read
```

#### Mark All as Read
```
PUT /api/v1/notifications/read-all
```

#### Update Preferences
```
PUT /api/v1/notifications/preferences
```

---

### Analytics

#### Get Sales Analytics
```
GET /api/v1/analytics/sales?period=month
```

#### Get Product Analytics
```
GET /api/v1/analytics/products/{productId}
```

---

## Rate Limiting

| Tier | Requests/Minute |
|------|----------------|
| Free | 100 |
| Pro | 1,000 |
| Enterprise | 10,000 |

Rate limit headers:
- `X-Rate-Limit-Remaining` - Remaining requests
- `X-Rate-Limit-Reset` - Unix timestamp reset

---

## Error Codes

### Authentication (AUTH_XXX)
| Code | Description |
|------|-------------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Account locked |
| AUTH_003 | Account suspended |
| AUTH_004 | Email not verified |
| AUTH_005 | Token expired |
| AUTH_009 | MFA required |

### Validation (VAL_XXX)
| Code | Description |
|------|-------------|
| VAL_001 | Validation failed |
| VAL_002 | Invalid request body |
| VAL_003 | Missing required field |

### Resource (XXX_XXX)
| Code | Description |
|------|-------------|
| USER_001 | User not found |
| PROD_001 | Product not found |
| ORDER_001 | Order not found |
| CART_001 | Cart not found |

---

## Pagination

Default page size: 20
Maximum page size: 100

```bash
GET /api/v1/products?page=0&size=20&sortBy=createdAt&sortDir=desc
```

Response:
```json
{
  "success": true,
  "data": {
    "content": [...],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "first": true,
    "last": false
  }
}
```

---

## SDKs & Client Libraries

Official SDKs coming soon:
- JavaScript/TypeScript
- Python
- Java
- Go
- Ruby
- PHP

---

## Support

- **Documentation**: https://docs.pricebrain.com
- **API Status**: https://status.pricebrain.com
- **Email**: api-support@pricebrain.com
- **Slack**: #api-support
