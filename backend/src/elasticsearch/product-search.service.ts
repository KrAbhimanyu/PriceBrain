import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { ProductsService } from '../products/products.service';
import { CacheService } from '../cache/cache.service';

interface SearchFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  retailer?: string;
}

interface SearchResult {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    facets: {
      brands: Array<{ name: string; slug: string; count: number }>;
      categories: Array<{ name: string; slug: string; count: number }>;
      retailers: Array<{ name: string; id: string; count: number }>;
      priceRange: { min: number; max: number };
      ratings: Array<{ value: number; count: number }>;
    };
    aggregations: {
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
      avgRating: number;
    };
  };
}

@Injectable()
export class ProductSearchService {
  private readonly logger = new Logger(ProductSearchService.name);
  private readonly indexName = 'products';

  constructor(
    private esService: ElasticsearchService,
    private productsService: ProductsService,
    private cacheService: CacheService,
  ) {}

  async search(
    query: string,
    page = 1,
    limit = 20,
    filters: SearchFilters = {},
    sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' = 'relevance',
  ): Promise<SearchResult> {
    // Check if Elasticsearch is available
    const isAvailable = await this.esService.isAvailable();

    if (!isAvailable) {
      return this.databaseFallback(query, page, limit, filters, sortBy);
    }

    try {
      return await this.elasticsearchSearch(query, page, limit, filters, sortBy);
    } catch (error) {
      this.logger.error('Elasticsearch search failed, falling back to database:', error);
      return this.databaseFallback(query, page, limit, filters, sortBy);
    }
  }

  private async elasticsearchSearch(
    query: string,
    page: number,
    limit: number,
    filters: SearchFilters,
    sortBy: string,
  ): Promise<SearchResult> {
    const from = (page - 1) * limit;

    const must: any[] = [{ match: { isActive: true } }];
    const filter: any[] = [];

    if (query && query.trim()) {
      must.push({
        multi_match: {
          query: query.trim(),
          fields: ['name^3', 'description', 'brand^2', 'category'],
          type: 'best_fields',
          fuzziness: 'AUTO',
          prefix_length: 2,
        },
      });
    }

    if (filters.category) {
      filter.push({ term: { categorySlug: filters.category } });
    }

    if (filters.brand) {
      filter.push({ term: { brandSlug: filters.brand } });
    }

    if (filters.minPrice) {
      filter.push({ range: { lowestPrice: { gte: filters.minPrice } } });
    }

    if (filters.maxPrice) {
      filter.push({ range: { lowestPrice: { lte: filters.maxPrice } } });
    }

    if (filters.minRating) {
      filter.push({ range: { rating: { gte: filters.minRating } } });
    }

    if (filters.inStock !== undefined) {
      filter.push({ term: { inStock: filters.inStock } });
    }

    const sort: any[] = [];
    switch (sortBy) {
      case 'price_asc':
        sort.push({ lowestPrice: 'asc' });
        break;
      case 'price_desc':
        sort.push({ lowestPrice: 'desc' });
        break;
      case 'rating':
        sort.push({ rating: 'desc' });
        break;
      case 'newest':
        sort.push({ createdAt: 'desc' });
        break;
      default:
        sort.push({ _score: 'desc' }, { isFeatured: 'desc' });
    }

    const searchParams = {
      index: this.indexName,
      from,
      size: limit,
      query: {
        bool: {
          must,
          filter,
        },
      },
      sort,
      aggs: {
        brands: {
          terms: { field: 'brandSlug', size: 20 },
        },
        categories: {
          terms: { field: 'categorySlug', size: 20 },
        },
        retailers: {
          nested: { path: 'retailerPrices' },
          aggs: {
            retailer_names: {
              terms: { field: 'retailerPrices.retailerName', size: 20 },
            },
          },
        },
        price_stats: {
          stats: { field: 'lowestPrice' },
        },
        rating_distribution: {
          range: {
            field: 'rating',
            ranges: [
              { key: '4+ stars', from: 4 },
              { key: '3+ stars', from: 3 },
              { key: '2+ stars', from: 2 },
              { key: '1+ stars', from: 1 },
            ],
          },
        },
      },
    };

    const esClient = (this.esService as any).esService;
    const response = await esClient.search(searchParams);

    const hits = response.hits.hits;
    const total = typeof response.hits.total === 'number' 
      ? response.hits.total 
      : response.hits.total?.value || 0;
    
    const aggs = response.aggregations as any;

    return {
      data: hits.map((hit: any) => hit._source),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        facets: {
          brands: (aggs?.brands?.buckets || []).map((b: any) => ({
            name: b.key,
            slug: b.key,
            count: b.doc_count,
          })),
          categories: (aggs?.categories?.buckets || []).map((b: any) => ({
            name: b.key,
            slug: b.key,
            count: b.doc_count,
          })),
          retailers: (aggs?.retailers?.retailer_names?.buckets || []).map((b: any) => ({
            name: b.key,
            id: b.key,
            count: b.doc_count,
          })),
          priceRange: {
            min: aggs?.price_stats?.min || 0,
            max: aggs?.price_stats?.max || 0,
          },
          ratings: (aggs?.rating_distribution?.buckets || []).map((b: any) => ({
            value: parseFloat(b.key),
            count: b.doc_count,
          })),
        },
        aggregations: {
          avgPrice: aggs?.price_stats?.avg || 0,
          minPrice: aggs?.price_stats?.min || 0,
          maxPrice: aggs?.price_stats?.max || 0,
          avgRating: aggs?.price_stats?.avg || 0,
        },
      },
    };
  }

  private async databaseFallback(
    query: string,
    page: number,
    limit: number,
    filters: SearchFilters,
    sortBy: string,
  ): Promise<SearchResult> {
    const result: any = await this.productsService.findAll({
      page,
      limit,
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy,
    });

    return {
      data: result.data || [],
      meta: {
        ...(result.meta || {}),
        facets: {
          brands: [],
          categories: [],
          retailers: [],
          priceRange: { min: 0, max: 0 },
          ratings: [],
        },
        aggregations: {
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          avgRating: 0,
        },
      },
    };
  }

  async getAutocomplete(query: string, limit = 10): Promise<Array<{ id: string; name: string; slug: string; type: string }>> {
    const isAvailable = await this.esService.isAvailable();

    if (!isAvailable) {
      return this.productsService.search(query, limit).then((products) =>
        products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, type: 'product' })),
      );
    }

    try {
      const esClient = (this.esService as any).esService;
      const response = await esClient.search({
        index: this.indexName,
        suggest: {
          'product-suggest': {
            prefix: query,
            completion: {
              field: 'name.suggest',
              size: limit,
              skip_duplicates: true,
              fuzzy: {
                fuzziness: 'AUTO',
              },
            },
          },
        },
      });

      const suggestResult = response.suggest?.['product-suggest']?.[0];
      const options = suggestResult?.options || [];
      return options.map((s: any) => ({
        id: s._source?.id || '',
        name: s._source?.name || s.text || '',
        slug: s._source?.slug || '',
        type: 'product' as const,
      }));
    } catch (error) {
      this.logger.error('Autocomplete failed:', error);
      return this.productsService.search(query, limit).then((products) =>
        products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, type: 'product' })),
      );
    }
  }

  async reindexAllProducts(): Promise<void> {
    const isAvailable = await this.esService.isAvailable();
    if (!isAvailable) {
      this.logger.warn('Cannot reindex: Elasticsearch not available');
      return;
    }

    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const result: any = await this.productsService.findAll({ page, limit });
      if (result.data && result.data.length > 0) {
        await this.esService.bulkIndexProducts(result.data);
        hasMore = page < (result.meta?.totalPages || 0);
        page++;
      } else {
        hasMore = false;
      }
    }

    this.logger.log('Reindexing complete');
  }
}
