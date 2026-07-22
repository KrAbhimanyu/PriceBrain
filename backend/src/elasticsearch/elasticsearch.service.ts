import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly indexName = 'products';

  constructor(private readonly esService: NestElasticsearchService) {}

  async onModuleInit() {
    try {
      await this.createIndex();
    } catch (error) {
      this.logger.warn('Elasticsearch not available, search will use database fallback');
    }
  }

  async createIndex(): Promise<void> {
    const indexExists = await this.esService.indices.exists({ index: this.indexName });

    if (!indexExists) {
      await this.esService.indices.create({
        index: this.indexName,
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              product_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding', 'product_synonyms', 'product_stemmer'],
              },
            },
            filter: {
              product_synonyms: {
                type: 'synonym',
                synonyms: [
                  'phone, mobile, cellphone, smartphone',
                  'laptop, notebook, computer',
                  'tv, television, telly',
                  'headphones, earphones, earbuds, earbuds',
                  'watch, smartwatch, fitness tracker',
                  'shoes, footwear, sneakers, sandals',
                ],
              },
              product_stemmer: {
                type: 'stemmer',
                language: 'english',
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'product_analyzer',
              fields: {
                keyword: { type: 'keyword' },
                suggest: {
                  type: 'completion',
                  analyzer: 'simple',
                  preserve_separators: true,
                  preserve_position_increments: true,
                  max_input_length: 50,
                },
              },
            },
            description: { type: 'text', analyzer: 'product_analyzer' },
            brand: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            brandSlug: { type: 'keyword' },
            category: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            categorySlug: { type: 'keyword' },
            slug: { type: 'keyword' },
            lowestPrice: { type: 'float' },
            highestPrice: { type: 'float' },
            rating: { type: 'float' },
            reviewCount: { type: 'integer' },
            inStock: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            isActive: { type: 'boolean' },
            images: {
              type: 'nested',
              properties: {
                url: { type: 'keyword' },
                isPrimary: { type: 'boolean' },
              },
            },
            retailerPrices: {
              type: 'nested',
              properties: {
                retailerId: { type: 'keyword' },
                retailerName: { type: 'text' },
                price: { type: 'float' },
                inStock: { type: 'boolean' },
              },
            },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        },
      });

      this.logger.log(`Created Elasticsearch index: ${this.indexName}`);
    }
  }

  async indexProduct(product: any): Promise<void> {
    try {
      await this.esService.index({
        index: this.indexName,
        id: product.id,
        document: {
          id: product.id,
          name: product.name,
          description: product.description,
          brand: product.brand?.name,
          brandSlug: product.brand?.slug,
          category: product.category?.name,
          categorySlug: product.category?.slug,
          slug: product.slug,
          lowestPrice: product.lowestPrice,
          highestPrice: product.highestPrice,
          rating: product.rating,
          reviewCount: product.reviewCount,
          inStock: product.inStock,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          images: product.images?.map((img: any) => ({
            url: img.url,
            isPrimary: img.isPrimary,
          })),
          retailerPrices: product.retailerPrices?.map((rp: any) => ({
            retailerId: rp.retailerId,
            retailerName: rp.retailer?.name,
            price: rp.price,
            inStock: rp.inStock,
          })),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index product ${product.id}:`, error);
    }
  }

  async bulkIndexProducts(products: any[]): Promise<void> {
    const operations = products.flatMap((product) => [
      { index: { _index: this.indexName, _id: product.id } },
      {
        id: product.id,
        name: product.name,
        description: product.description,
        brand: product.brand?.name,
        brandSlug: product.brand?.slug,
        category: product.category?.name,
        categorySlug: product.category?.slug,
        slug: product.slug,
        lowestPrice: product.lowestPrice,
        highestPrice: product.highestPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        images: product.images?.map((img: any) => ({
          url: img.url,
          isPrimary: img.isPrimary,
        })),
        retailerPrices: product.retailerPrices?.map((rp: any) => ({
          retailerId: rp.retailerId,
          retailerName: rp.retailer?.name,
          price: rp.price,
          inStock: rp.inStock,
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    ]);

    if (operations.length > 0) {
      try {
        const result = await this.esService.bulk({ operations, refresh: true });
        if (result.errors) {
          this.logger.error('Bulk indexing had errors');
        } else {
          this.logger.log(`Bulk indexed ${products.length} products`);
        }
      } catch (error) {
        this.logger.error('Bulk indexing failed:', error);
      }
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.esService.delete({
        index: this.indexName,
        id: productId,
      });
    } catch (error) {
      this.logger.error(`Failed to delete product ${productId} from index`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.esService.cluster.health();
      return health.status !== 'red';
    } catch {
      return false;
    }
  }
}
