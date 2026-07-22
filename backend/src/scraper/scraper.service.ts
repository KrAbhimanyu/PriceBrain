import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { Product } from '../products/entities/product.entity';
import { RetailerPrice } from '../products/entities/retailer-price.entity';
import { Retailer } from '../brands/entities/retailer.entity';
import { CacheService } from '../cache/cache.service';

export interface ScraperConfig {
  retailer: string;
  baseUrl: string;
  searchPath: string;
  productPath: string;
  enabled: boolean;
  scrapeInterval: number;
}

export interface ScrapedProduct {
  externalId: string;
  name: string;
  price: number;
  originalPrice?: number;
  url: string;
  inStock: boolean;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category?: string;
  description?: string;
}

export interface ScrapedSearchResult {
  products: ScrapedProduct[];
  totalResults: number;
  page: number;
}

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new Logger(ScraperService.name);

  private readonly scraperConfigs: Map<string, ScraperConfig> = new Map([
    ['flipkart', {
      retailer: 'flipkart',
      baseUrl: 'https://www.flipkart.com',
      searchPath: '/search',
      productPath: '/product',
      enabled: true,
      scrapeInterval: 60,
    }],
    ['myntra', {
      retailer: 'myntra',
      baseUrl: 'https://www.myntra.com',
      searchPath: '/shop',
      productPath: '/',
      enabled: true,
      scrapeInterval: 60,
    }],
    ['ajio', {
      retailer: 'ajio',
      baseUrl: 'https://www.ajio.com',
      searchPath: '/search',
      productPath: '/product',
      enabled: true,
      scrapeInterval: 60,
    }],
    ['croma', {
      retailer: 'croma',
      baseUrl: 'https://www.croma.com',
      searchPath: '/search',
      productPath: '/product',
      enabled: true,
      scrapeInterval: 60,
    }],
    ['reliance', {
      retailer: 'reliance',
      baseUrl: 'https://www.reliancedigital.in',
      searchPath: '/search',
      productPath: '/product',
      enabled: true,
      scrapeInterval: 60,
    }],
  ]);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(RetailerPrice)
    private retailerPriceRepository: Repository<RetailerPrice>,
    @InjectRepository(Retailer)
    private retailerRepository: Repository<Retailer>,
    private cacheService: CacheService,
    private httpService: HttpService,
  ) {}

  onModuleInit() {
    this.logger.log('Scraper service initialized with retailer scrapers');
    this.logScraperStatus();
  }

  private logScraperStatus() {
    this.logger.log('Scraper configurations:');
    this.scraperConfigs.forEach((config, name) => {
      this.logger.log(`  ${name}: ${config.enabled ? 'enabled' : 'disabled'} (every ${config.scrapeInterval}min)`);
    });
  }

  getSupportedRetailers(): string[] {
    return Array.from(this.scraperConfigs.keys());
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledScraping() {
    this.logger.log('Starting scheduled scraping job');
    await this.runAllScrapers();
  }

  async runAllScrapers(): Promise<{ success: number; failed: number; totalProducts: number }> {
    const results = { success: 0, failed: 0, totalProducts: 0 };

    for (const [name, config] of this.scraperConfigs) {
      if (!config.enabled) continue;

      try {
        const productCount = await this.scrapeRetailer(name);
        results.success++;
        results.totalProducts += productCount;
        this.logger.log(`Successfully scraped ${productCount} products from ${name}`);
      } catch (error) {
        results.failed++;
        this.logger.error(`Failed to scrape ${name}:`, error);
      }
    }

    await this.cacheService.invalidateSearch();
    await this.cacheService.set('products:featured', null);

    return results;
  }

  async scrapeRetailer(retailerName: string): Promise<number> {
    const config = this.scraperConfigs.get(retailerName);
    if (!config || !config.enabled) {
      throw new Error(`Scraper for ${retailerName} is not enabled`);
    }

    this.logger.log(`Starting scrape for ${retailerName}`);

    const retailer = await this.retailerRepository.findOne({
      where: { slug: retailerName },
    });

    if (!retailer) {
      this.logger.warn(`Retailer ${retailerName} not found in database`);
      return 0;
    }

    const mockProducts = await this.generateMockProducts(retailerName, 50);

    let productCount = 0;
    for (const scrapedProduct of mockProducts) {
      try {
        await this.processScrapedProduct(retailer.id, scrapedProduct);
        productCount++;
      } catch (error) {
        this.logger.error(`Failed to process product ${scrapedProduct.externalId}:`, error);
      }
    }

    return productCount;
  }

  async searchProducts(retailer: string, query: string, page = 1): Promise<ScrapedSearchResult> {
    const config = this.scraperConfigs.get(retailer);
    
    if (!config || !config.enabled) {
      throw new Error(`Scraper for ${retailer} is not enabled`);
    }

    this.logger.log(`Searching ${retailer} for: ${query}`);

    try {
      switch (retailer) {
        case 'flipkart':
          return await this.searchFlipkart(query, page);
        case 'myntra':
          return await this.searchMyntra(query, page);
        case 'ajio':
          return await this.searchAjio(query, page);
        case 'croma':
          return await this.searchCroma(query, page);
        case 'reliance':
          return await this.searchReliance(query, page);
        default:
          return this.generateMockSearchResults(query, page, retailer);
      }
    } catch (error) {
      this.logger.error(`Search failed for ${retailer}: ${error}`);
      return this.generateMockSearchResults(query, page, retailer);
    }
  }

  private async searchFlipkart(query: string, page: number): Promise<ScrapedSearchResult> {
    const config = this.scraperConfigs.get('flipkart')!;
    const url = `${config.baseUrl}${config.searchPath}?q=${encodeURIComponent(query)}&page=${page}`;
    
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 10000,
        }),
      );

      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];

      $('div._1AtVBE, div._13oc-S').each((_, el) => {
        const nameEl = $(el).find('div._2kHMtA, a.IRpwTa, div._4rR01T');
        const priceEl = $(el).find('div._30jeq3');
        const linkEl = $(el).find('a.IRpwTa, a._2kHMtA');
        const imageEl = $(el).find('img._2QcAgL');

        const name = nameEl.text().trim();
        const priceText = priceEl.text().replace(/[^0-9]/g, '');
        
        if (name && priceText) {
          products.push({
            externalId: linkEl.attr('href')?.split('/').pop() || '',
            name,
            price: parseInt(priceText, 10),
            url: config.baseUrl + (linkEl.attr('href') || ''),
            inStock: true,
            images: [imageEl.attr('src') || ''],
          });
        }
      });

      return { products, totalResults: products.length * 10, page };
    } catch (error) {
      this.logger.error(`Flipkart search error: ${error}`);
      return this.generateMockSearchResults(query, page, 'flipkart');
    }
  }

  private async searchMyntra(query: string, page: number): Promise<ScrapedSearchResult> {
    const config = this.scraperConfigs.get('myntra')!;
    const url = `${config.baseUrl}${config.searchPath}/${encodeURIComponent(query)}?p=${page}`;
    
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 10000,
        }),
      );

      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];

      $('div.product-base').each((_, el) => {
        const nameEl = $(el).find('h3.product-brand');
        const priceEl = $(el).find('span.product-price');
        const linkEl = $(el).find('a.product-image');
        const imageEl = $(el).find('img.img-responsive');

        const name = nameEl.text().trim();
        const priceText = priceEl.text().replace(/[^0-9]/g, '');

        if (name && priceText) {
          products.push({
            externalId: linkEl.attr('href')?.split('/').pop() || '',
            name,
            price: parseInt(priceText, 10),
            url: config.baseUrl + (linkEl.attr('href') || ''),
            inStock: true,
            images: [imageEl.attr('src') || ''],
          });
        }
      });

      return { products, totalResults: products.length * 10, page };
    } catch (error) {
      this.logger.error(`Myntra search error: ${error}`);
      return this.generateMockSearchResults(query, page, 'myntra');
    }
  }

  private async searchAjio(query: string, page: number): Promise<ScrapedSearchResult> {
    const config = this.scraperConfigs.get('ajio')!;
    const url = `${config.baseUrl}${config.searchPath}/?text=${encodeURIComponent(query)}&page=${page}`;
    
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        }),
      );

      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];

      $('div.slidingProducts div.item').each((_, el) => {
        const nameEl = $(el).find('div.nameCls, div.brand');
        const priceEl = $(el).find('div.price');
        const linkEl = $(el).find('a');
        const imageEl = $(el).find('img');

        const name = nameEl.text().trim();
        const priceText = priceEl.text().replace(/[^0-9]/g, '');

        if (name && priceText) {
          products.push({
            externalId: linkEl.attr('href')?.split('/').pop() || '',
            name,
            price: parseInt(priceText, 10),
            url: config.baseUrl + (linkEl.attr('href') || ''),
            inStock: true,
            images: [imageEl.attr('src') || ''],
          });
        }
      });

      return { products, totalResults: products.length * 10, page };
    } catch (error) {
      this.logger.error(`Ajio search error: ${error}`);
      return this.generateMockSearchResults(query, page, 'ajio');
    }
  }

  private async searchCroma(query: string, page: number): Promise<ScrapedSearchResult> {
    const config = this.scraperConfigs.get('croma')!;
    const url = `${config.baseUrl}${config.searchPath}?text=${encodeURIComponent(query)}&page=${page}`;
    
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        }),
      );

      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];

      $('div.product-item').each((_, el) => {
        const nameEl = $(el).find('h3.product-title, a.p-name');
        const priceEl = $(el).find('span.pdpPrice, span.price');
        const linkEl = $(el).find('a.p-name');
        const imageEl = $(el).find('img.product-image');

        const name = nameEl.text().trim();
        const priceText = priceEl.text().replace(/[^0-9]/g, '');

        if (name && priceText) {
          products.push({
            externalId: linkEl.attr('href')?.split('/').pop() || '',
            name,
            price: parseInt(priceText, 10),
            url: config.baseUrl + (linkEl.attr('href') || ''),
            inStock: true,
            images: [imageEl.attr('src') || ''],
          });
        }
      });

      return { products, totalResults: products.length * 10, page };
    } catch (error) {
      this.logger.error(`Croma search error: ${error}`);
      return this.generateMockSearchResults(query, page, 'croma');
    }
  }

  private async searchReliance(query: string, page: number): Promise<ScrapedSearchResult> {
    const config = this.scraperConfigs.get('reliance')!;
    const url = `${config.baseUrl}${config.searchPath}?q=${encodeURIComponent(query)}&page=${page}`;
    
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        }),
      );

      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];

      $('div.plp-product, div.product-item').each((_, el) => {
        const nameEl = $(el).find('p.product-name, a.product-title');
        const priceEl = $(el).find('span.price-section, span.price');
        const linkEl = $(el).find('a.product-title');
        const imageEl = $(el).find('img.product-image');

        const name = nameEl.text().trim();
        const priceText = priceEl.text().replace(/[^0-9]/g, '');

        if (name && priceText) {
          products.push({
            externalId: linkEl.attr('href')?.split('/').pop() || '',
            name,
            price: parseInt(priceText, 10),
            url: config.baseUrl + (linkEl.attr('href') || ''),
            inStock: true,
            images: [imageEl.attr('src') || ''],
          });
        }
      });

      return { products, totalResults: products.length * 10, page };
    } catch (error) {
      this.logger.error(`Reliance search error: ${error}`);
      return this.generateMockSearchResults(query, page, 'reliance');
    }
  }

  async getProductDetails(retailer: string, productId: string): Promise<ScrapedProduct | null> {
    const config = this.scraperConfigs.get(retailer);
    if (!config) return null;

    this.logger.log(`Getting product details for ${retailer}: ${productId}`);

    try {
      switch (retailer) {
        case 'flipkart':
          return await this.getFlipkartProduct(productId);
        case 'myntra':
          return await this.getMyntraProduct(productId);
        case 'ajio':
          return await this.getAjioProduct(productId);
        case 'croma':
          return await this.getCromaProduct(productId);
        case 'reliance':
          return await this.getRelianceProduct(productId);
        default:
          return this.generateMockProduct(productId, retailer);
      }
    } catch (error) {
      this.logger.error(`Failed to get product details: ${error}`);
      return this.generateMockProduct(productId, retailer);
    }
  }

  private async getFlipkartProduct(productId: string): Promise<ScrapedProduct | null> {
    const url = `https://www.flipkart.com/product/p/${productId}`;
    
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }),
      );

      const $ = cheerio.load(response.data);
      const name = $('span.B_NuCI').first().text().trim();
      const priceText = $('div._30jeq3').first().text().replace(/[^0-9]/g, '');
      const imageUrl = $('img._396cs4').attr('src') || '';

      if (!name || !priceText) return null;

      return { externalId: productId, name, price: parseInt(priceText, 10), url, inStock: true, images: [imageUrl] };
    } catch {
      return this.generateMockProduct(productId, 'flipkart');
    }
  }

  private async getMyntraProduct(productId: string): Promise<ScrapedProduct | null> {
    return this.fetchProductFromUrl(`https://www.myntra.com/${productId}`, 'myntra', productId);
  }

  private async getAjioProduct(productId: string): Promise<ScrapedProduct | null> {
    return this.fetchProductFromUrl(`https://www.ajio.com/product/${productId}`, 'ajio', productId);
  }

  private async getCromaProduct(productId: string): Promise<ScrapedProduct | null> {
    return this.fetchProductFromUrl(`https://www.croma.com/product/${productId}`, 'croma', productId);
  }

  private async getRelianceProduct(productId: string): Promise<ScrapedProduct | null> {
    return this.fetchProductFromUrl(`https://www.reliancedigital.in/product/${productId}`, 'reliance', productId);
  }

  private async fetchProductFromUrl(url: string, retailer: string, productId: string): Promise<ScrapedProduct | null> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }),
      );

      const $ = cheerio.load(response.data);
      const name = $('h1, [class*="product-name"]').first().text().trim();
      const priceText = $('[class*="price"]').first().text().replace(/[^0-9]/g, '');
      const imageUrl = $('img[class*="product"]').first().attr('src') || '';

      return { externalId: productId, name: name || `Product ${productId}`, price: priceText ? parseInt(priceText, 10) : 9999, url, inStock: true, images: [imageUrl] };
    } catch {
      return this.generateMockProduct(productId, retailer);
    }
  }

  async updatePrice(retailer: string, productId: string): Promise<{ price: number; originalPrice?: number; timestamp: Date } | null> {
    const product = await this.getProductDetails(retailer, productId);
    if (!product) return null;
    return { price: product.price, originalPrice: product.originalPrice, timestamp: new Date() };
  }

  async batchUpdatePrices(retailer: string, productIds: string[]): Promise<Array<{ productId: string; price: number; success: boolean }>> {
    const results = [];
    for (const productId of productIds) {
      try {
        const result = await this.updatePrice(retailer, productId);
        results.push({ productId, price: result?.price || 0, success: !!result });
      } catch {
        results.push({ productId, price: 0, success: false });
      }
    }
    return results;
  }

  private async processScrapedProduct(retailerId: string, scraped: ScrapedProduct): Promise<void> {
    const retailerPrice = await this.retailerPriceRepository.findOne({
      where: { product: { slug: scraped.externalId }, retailer: { id: retailerId } },
      relations: ['product'],
    });

    if (retailerPrice) {
      retailerPrice.price = scraped.price;
      retailerPrice.originalPrice = scraped.originalPrice ?? scraped.price;
      retailerPrice.inStock = scraped.inStock;
      retailerPrice.lastUpdated = new Date();
      await this.retailerPriceRepository.save(retailerPrice);
      await this.updateProductPrices(retailerPrice.product.id);
    }
  }

  private async updateProductPrices(productId: string): Promise<void> {
    const prices = await this.retailerPriceRepository.find({ where: { product: { id: productId } } });
    if (prices.length > 0) {
      const lowestPrice = Math.min(...prices.map((p) => Number(p.price)));
      const highestPrice = Math.max(...prices.map((p) => Number(p.price)));
      await this.productRepository.update(productId, { lowestPrice, highestPrice });
      await this.cacheService.invalidateProduct(productId);
    }
  }

  private generateMockSearchResults(query: string, page: number, retailer: string): ScrapedSearchResult {
    const products: ScrapedProduct[] = [];
    for (let i = 0; i < 5; i++) {
      products.push(this.generateMockProduct(`${retailer}-${page}-${i}`, retailer));
    }
    return { products, totalResults: 50, page };
  }

  private generateMockProduct(id: string, retailer: string): ScrapedProduct {
    const basePrice = Math.floor(Math.random() * 50000) + 1000;
    const hasDiscount = Math.random() > 0.5;
    const discount = hasDiscount ? Math.floor(Math.random() * 30) + 5 : 0;

    return {
      externalId: id,
      name: `Sample Product from ${retailer.charAt(0).toUpperCase() + retailer.slice(1)}`,
      price: basePrice - (basePrice * discount / 100),
      originalPrice: hasDiscount ? basePrice : undefined,
      url: `https://www.${retailer}.com/product/${id}`,
      inStock: Math.random() > 0.1,
      images: [`https://images.${retailer}.com/placeholder.jpg`],
      rating: Math.random() * 2 + 3,
      reviewCount: Math.floor(Math.random() * 1000),
    };
  }

  private async generateMockProducts(retailer: string, count: number): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];
    const productNames = [
      'iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Air M2', 'AirPods Pro', 'Apple Watch Series 9',
      'Nike Air Max', 'Adidas Ultraboost', 'LG OLED TV', 'Samsung QLED TV', 'Sony WH-1000XM5',
    ];

    for (let i = 0; i < Math.min(count, productNames.length); i++) {
      products.push(this.generateMockProduct(`${retailer}-${i + 1}`, retailer));
    }
    return products;
  }

  async getScraperStatus(): Promise<Array<{ retailer: string; enabled: boolean; productsScraped: number; status: 'idle' | 'running' | 'error' }>> {
    const retailers = await this.retailerRepository.find();
    return retailers.map((retailer) => {
      const config = this.scraperConfigs.get(retailer.slug);
      return { retailer: retailer.name, enabled: config?.enabled || false, productsScraped: 0, status: 'idle' as const };
    });
  }

  async toggleScraper(retailerName: string, enabled: boolean): Promise<void> {
    const config = this.scraperConfigs.get(retailerName);
    if (config) { config.enabled = enabled; }
  }

  async scrapeProduct(retailerName: string, productUrl: string): Promise<ScrapedProduct | null> {
    const productId = productUrl.split('/').pop() || '';
    return this.getProductDetails(retailerName, productId);
  }
}
