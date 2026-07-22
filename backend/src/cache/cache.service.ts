import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  constructor(private redisService: RedisService) {}

  // Product caching
  async getProduct(idOrSlug: string) {
    return this.redisService.get(`product:${idOrSlug}`);
  }

  async setProduct(idOrSlug: string, product: any, ttl = 3600) {
    await this.redisService.set(`product:${idOrSlug}`, product, ttl);
  }

  async invalidateProduct(idOrSlug: string) {
    await this.redisService.del(`product:${idOrSlug}`);
  }

  // Search result caching
  async getSearchResults(query: string) {
    return this.redisService.get(`search:${encodeURIComponent(query)}`);
  }

  async setSearchResults(query: string, results: any, ttl = 300) {
    await this.redisService.set(`search:${encodeURIComponent(query)}`, results, ttl);
  }

  async invalidateSearch() {
    await this.redisService.delPattern('search:*');
  }

  // Category caching
  async getCategories() {
    return this.redisService.get('categories:all');
  }

  async setCategories(categories: any, ttl = 86400) {
    await this.redisService.set('categories:all', categories, ttl);
  }

  // Brand caching
  async getBrands() {
    return this.redisService.get('brands:all');
  }

  async setBrands(brands: any, ttl = 86400) {
    await this.redisService.set('brands:all', brands, ttl);
  }

  async getRetailers() {
    return this.redisService.get('retailers:all');
  }

  async setRetailers(retailers: any, ttl = 86400) {
    await this.redisService.set('retailers:all', retailers, ttl);
  }

  // Featured products caching
  async getFeaturedProducts() {
    return this.redisService.get('products:featured');
  }

  async setFeaturedProducts(products: any, ttl = 1800) {
    await this.redisService.set('products:featured', products, ttl);
  }

  // Trending searches caching
  async getTrendingSearches() {
    return this.redisService.get('searches:trending');
  }

  async setTrendingSearches(searches: any, ttl = 3600) {
    await this.redisService.set('searches:trending', searches, ttl);
  }

  async incrementSearchCount(query: string) {
    const key = `searches:count:${encodeURIComponent(query.toLowerCase())}`;
    return this.redisService.increment(key);
  }

  // Price history caching
  async getPriceHistory(productId: string) {
    return this.redisService.get(`price-history:${productId}`);
  }

  async setPriceHistory(productId: string, history: any, ttl = 1800) {
    await this.redisService.set(`price-history:${productId}`, history, ttl);
  }

  // Coupon caching
  async getCoupons(retailerId?: string) {
    const key = retailerId ? `coupons:${retailerId}` : 'coupons:all';
    return this.redisService.get(key);
  }

  async setCoupons(coupons: any, retailerId?: string, ttl = 3600) {
    const key = retailerId ? `coupons:${retailerId}` : 'coupons:all';
    await this.redisService.set(key, coupons, ttl);
  }

  async invalidateCoupons() {
    await this.redisService.delPattern('coupons:*');
  }

  // User wishlist caching
  async getWishlist(userId: string) {
    return this.redisService.get(`wishlist:${userId}`);
  }

  async setWishlist(userId: string, wishlist: any, ttl = 600) {
    await this.redisService.set(`wishlist:${userId}`, wishlist, ttl);
  }

  async invalidateWishlist(userId: string) {
    await this.redisService.del(`wishlist:${userId}`);
  }

  // Generic cache methods
  async get<T>(key: string): Promise<T | null> {
    return this.redisService.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.redisService.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.redisService.del(key);
  }
}
