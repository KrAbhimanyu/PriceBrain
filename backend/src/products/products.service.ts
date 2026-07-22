import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';
import { Product } from './entities/product.entity';
import { SearchProductsDto } from './dto/search-products.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private cacheService: CacheService,
  ) {}

  async findAll(query: SearchProductsDto) {
    const { page = 1, limit = 20, category, brand, minPrice, maxPrice, sortBy = 'relevance' } = query;
    const skip = (page - 1) * limit;

    // Check cache for first page without filters
    if (page === 1 && !category && !brand && !minPrice && !maxPrice) {
      const cacheKey = `products:list:${sortBy}:${limit}`;
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const queryBuilder = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isActive = :isActive', { isActive: true });

    if (category) {
      queryBuilder.andWhere('category.slug = :category', { category });
    }

    if (brand) {
      queryBuilder.andWhere('brand.slug = :brand', { brand });
    }

    if (minPrice) {
      queryBuilder.andWhere('product.lowestPrice >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      queryBuilder.andWhere('product.lowestPrice <= :maxPrice', { maxPrice });
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        queryBuilder.orderBy('product.lowestPrice', 'ASC');
        break;
      case 'price_desc':
        queryBuilder.orderBy('product.lowestPrice', 'DESC');
        break;
      case 'rating':
        queryBuilder.orderBy('product.rating', 'DESC');
        break;
      case 'newest':
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
      default:
        queryBuilder.orderBy('product.isFeatured', 'DESC').addOrderBy('product.lowestPrice', 'ASC');
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const result = {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache first page results
    if (page === 1 && !category && !brand && !minPrice && !maxPrice) {
      await this.cacheService.set(`products:list:${sortBy}:${limit}`, result, 300);
    }

    return result;
  }

  async findOne(idOrSlug: string): Promise<Product> {
    // Check cache first
    const cached = await this.cacheService.getProduct(idOrSlug);
    if (cached) {
      return cached as Product;
    }

    const product = await this.productsRepository.findOne({
      where: [{ id: idOrSlug }, { slug: idOrSlug }],
      relations: ['brand', 'category', 'images', 'retailerPrices', 'specifications'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Cache the result
    await this.cacheService.setProduct(idOrSlug, product, 3600);

    return product;
  }

  async findFeatured(limit = 10): Promise<Product[]> {
    // Check cache first
    const cached = await this.cacheService.getFeaturedProducts();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached.slice(0, limit);
    }

    const products = await this.productsRepository.find({
      where: { isActive: true, isFeatured: true },
      relations: ['brand', 'category', 'images'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });

    // Cache featured products
    if (products.length > 0) {
      await this.cacheService.setFeaturedProducts(products, 1800);
    }

    return products;
  }

  async getRelated(productId: string, limit = 10): Promise<Product[]> {
    const product = await this.findOne(productId);
    
    return this.productsRepository.find({
      where: { 
        categoryId: product.categoryId, 
        isActive: true,
        id: Not(productId),
      },
      relations: ['brand', 'category', 'images'],
      take: limit,
    });
  }

  async search(query: string, limit = 10): Promise<Product[]> {
    // Check cache first
    const cacheKey = `products:search:${encodeURIComponent(query)}:${limit}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as Product[];
    }

    const products = await this.productsRepository.find({
      where: [
        { name: Like(`%${query}%`), isActive: true },
        { slug: Like(`%${query}%`), isActive: true },
      ],
      relations: ['brand', 'category', 'images'],
      take: limit,
    });

    // Cache search results
    if (products.length > 0) {
      await this.cacheService.set(cacheKey, products, 300);
    }

    return products;
  }

  async getFacets(category?: string, brand?: string) {
    const queryBuilder = this.productsRepository.createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('product.category', 'category')
      .select('brand.name', 'brandName')
      .addSelect('brand.slug', 'brandSlug')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.isActive = :isActive', { isActive: true })
      .groupBy('brand.name')
      .addGroupBy('brand.slug')
      .orderBy('count', 'DESC');

    if (category) {
      queryBuilder.andWhere('category.slug = :category', { category });
    }

    const brands = await queryBuilder.getRawMany();

    return {
      brands: brands.map((b) => ({
        label: b.brandName,
        value: b.brandSlug,
        count: parseInt(b.count),
      })),
    };
  }
}
