# PriceBrain API Documentation

## Overview

PriceBrain API is a RESTful API built with NestJS that powers the price comparison platform.

## Base URL

- Development: `http://localhost:3001`
- Staging: `https://api-staging.pricebrain.com`
- Production: `https://api.pricebrain.com`

## Authentication

Most endpoints require authentication using JWT Bearer tokens.

### Auth Headers
```
Authorization: Bearer <access_token>
```

### Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe" },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

---

## Products

#### GET /api/products
Get paginated list of products.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `category` (string, optional)
- `brand` (string, optional)
- `minPrice` (number, optional)
- `maxPrice` (number, optional)
- `sortBy` (string: `price_asc`, `price_desc`, `rating`, `newest`)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 1000,
    "page": 1,
    "limit": 20,
    "totalPages": 50
  }
}
```

#### GET /api/products/:slug
Get single product by slug.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "...",
    "lowestPrice": 119900,
    "highestPrice": 159900,
    "rating": 4.5,
    "reviewCount": 1234,
    "images": [...],
    "retailerPrices": [...],
    "brand": {...},
    "category": {...}
  }
}
```

#### GET /api/products/featured
Get featured products.

#### GET /api/products/deals
Get top deals (products with discounts).

---

## Search

#### GET /api/search
Search products with advanced filtering.

**Query Parameters:**
- `q` (string, required) - Search query
- `page` (number)
- `limit` (number)
- `category` (string)
- `brand` (string)
- `minPrice` (number)
- `maxPrice` (number)
- `minRating` (number)
- `inStock` (boolean)
- `sortBy` (string)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "facets": {
      "brands": [...],
      "categories": [...],
      "priceRange": { "min": 1000, "max": 100000 }
    }
  }
}
```

#### GET /api/search/suggestions
Get search autocomplete suggestions.

**Query Parameters:**
- `q` (string, required)
- `limit` (number, default: 10)

#### GET /api/search/trending
Get trending searches.

#### GET /api/search/categories
Get popular categories.

#### GET /api/search/brands
Get popular brands.

---

## Wishlist

#### GET /api/wishlist
Get user's wishlist (authenticated).

#### POST /api/wishlist
Add product to wishlist.

**Request Body:**
```json
{
  "productId": "uuid"
}
```

#### DELETE /api/wishlist/:productId
Remove product from wishlist.

---

## Compare

#### GET /api/compare
Compare multiple products.

**Query Parameters:**
- `products` (string) - Comma-separated product IDs

**Example:** `GET /api/compare?products=id1,id2,id3`

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "comparison": {
      "lowestPrice": {...},
      "highestPrice": {...},
      "bestRating": {...}
    }
  }
}
```

---

## Coupons

#### GET /api/coupons
Get available coupons.

**Query Parameters:**
- `retailer` (string, optional)
- `page` (number)
- `limit` (number)

#### POST /api/coupons/validate
Validate a coupon code.

**Request Body:**
```json
{
  "code": "SAVE20",
  "retailer": "amazon"
}
```

---

## Price History

#### GET /api/price-history/:productId
Get price history for a product.

**Query Parameters:**
- `days` (number, default: 30) - Number of days to fetch

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "uuid",
    "prices": [
      { "date": "2024-01-01", "price": 12999 },
      { "date": "2024-01-02", "price": 12499 }
    ],
    "stats": {
      "current": 12499,
      "lowest": 11999,
      "highest": 14999,
      "average": 13499
    }
  }
}
```

---

## Affiliate

#### GET /api/affiliate/link
Generate affiliate link (authenticated).

**Query Parameters:**
- `productId` (string, required)
- `retailerId` (string, required)

#### GET /api/affiliate/redirect/:linkId
Redirect to retailer with tracking.

---

## Analytics

#### GET /api/analytics/overview
Get analytics overview.

**Query Parameters:**
- `days` (number, default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSearches": 10000,
    "totalClicks": 5000,
    "totalConversions": 100,
    "totalRevenue": 50000,
    "topSearches": [...],
    "topProducts": [...]
  }
}
```

#### GET /api/analytics/daily
Get daily statistics.

#### GET /api/analytics/product/:productId
Get analytics for a specific product.

#### GET /api/analytics/search
Get search analytics.

---

## Admin

### Products Management

#### GET /api/admin/products
Get all products (admin only).

#### POST /api/admin/products
Create new product.

#### PUT /api/admin/products/:id
Update product.

#### DELETE /api/admin/products/:id
Delete product.

### User Management

#### GET /api/admin/users
Get all users.

#### PUT /api/admin/users/:id/role
Update user role.

#### DELETE /api/admin/users/:id
Delete user.

### Retailer Management

#### GET /api/admin/retailers
Get all retailers.

#### POST /api/admin/retailers
Create retailer.

#### PUT /api/admin/retailers/:id
Update retailer.

### Scraper Management

#### GET /api/scraper/status
Get scraper status.

#### POST /api/scraper/run
Run all scrapers.

#### POST /api/scraper/run/:retailer
Run scraper for specific retailer.

#### POST /api/scraper/toggle/:retailer
Toggle scraper on/off.

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Auth endpoints | 10/min |
| Search | 30/min |
| General API | 100/min |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response Headers:**
- `X-Total-Count`: Total number of items
- `X-Total-Pages`: Total number of pages

---

## Webhooks (Future)

PriceBrain will support webhooks for:
- `product.price_updated`
- `product.back_in_stock`
- `user.wishlist.price_drop`
- `affiliate.conversion`

---

## SDKs

- **JavaScript/TypeScript**: `@pricebrain/sdk`
- **Python**: `pricebrain-python`
- **Go**: `pricebrain-go`

---

## Support

- Email: api-support@pricebrain.com
- Documentation: docs.pricebrain.com
