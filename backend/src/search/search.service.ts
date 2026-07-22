import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class SearchService {
  constructor(
    private productsService: ProductsService,
    private cacheService: CacheService,
  ) {}

  async search(query: string, page = 1, limit = 20) {
    // Check cache first for search results
    const cacheKey = `search:${encodeURIComponent(query)}:${page}:${limit}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.productsService.findAll({
      page,
      limit,
      q: query,
    } as any);

    // Cache search results
    if (result) {
      await this.cacheService.set(cacheKey, result, 300);
    }

    // Increment search count for trending
    if (query && query.length > 2) {
      this.cacheService.incrementSearchCount(query).catch(() => {});
    }

    return result;
  }

  async suggestions(query: string, limit = 10) {
    // Check cache first
    const cacheKey = `suggestions:${encodeURIComponent(query)}:${limit}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const products = await this.productsService.search(query, limit);
    
    const suggestions: Array<{ id: string; text: string; type: 'product' | 'search'; slug: string }> = products.map((p) => ({
      id: p.id,
      text: p.name,
      type: 'product' as const,
      slug: p.slug,
    }));

    // Add category suggestions
    if (query.length > 2) {
      suggestions.push({
        id: `cat-${query}`,
        text: `Search for "${query}"`,
        type: 'search',
        slug: `/search?q=${encodeURIComponent(query)}`,
      });
    }

    const result = suggestions.slice(0, limit);

    // Cache suggestions
    if (result.length > 0) {
      await this.cacheService.set(cacheKey, result, 300);
    }

    return result;
  }

  async getTrendingSearches(limit = 10) {
    const cached = await this.cacheService.getTrendingSearches();
    if (cached) {
      return cached;
    }

    // Return default trending searches if no data
    const trending = [
      { query: 'iPhone', count: 1234 },
      { query: 'Samsung', count: 987 },
      { query: 'Laptop', count: 876 },
      { query: 'Headphones', count: 765 },
      { query: 'Smart Watch', count: 654 },
    ];

    await this.cacheService.setTrendingSearches(trending, 3600);
    return trending.slice(0, limit);
  }

  async getPopularCategories(limit = 10) {
    const cacheKey = `popular-categories:${limit}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Return default categories
    const categories = [
      { id: 'electronics', name: 'Electronics', slug: 'electronics', productCount: 5000 },
      { id: 'fashion', name: 'Fashion', slug: 'fashion', productCount: 3500 },
      { id: 'home', name: 'Home & Kitchen', slug: 'home-kitchen', productCount: 2800 },
      { id: 'beauty', name: 'Beauty', slug: 'beauty', productCount: 2100 },
      { id: 'sports', name: 'Sports', slug: 'sports', productCount: 1800 },
    ];

    await this.cacheService.set(cacheKey, categories, 86400);
    return categories.slice(0, limit);
  }

  async getPopularBrands(limit = 10) {
    const cacheKey = `popular-brands:${limit}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Return default brands
    const brands = [
      { id: 'apple', name: 'Apple', slug: 'apple', productCount: 450 },
      { id: 'samsung', name: 'Samsung', slug: 'samsung', productCount: 380 },
      { id: 'sony', name: 'Sony', slug: 'sony', productCount: 290 },
      { id: 'oneplus', name: 'OnePlus', slug: 'oneplus', productCount: 220 },
      { id: 'nike', name: 'Nike', slug: 'nike', productCount: 180 },
    ];

    await this.cacheService.set(cacheKey, brands, 86400);
    return brands.slice(0, limit);
  }
}
