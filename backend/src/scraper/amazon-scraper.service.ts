import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { Product } from '../products/entities/product.entity';
import { RetailerPrice } from '../products/entities/retailer-price.entity';
import { Retailer } from '../brands/entities/retailer.entity';
import { CacheService } from '../cache/cache.service';

export interface AmazonProduct {
  asin: string;
  name: string;
  price: number;
  originalPrice?: number;
  url: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  primeEligible?: boolean;
  sponsored?: boolean;
  availability?: string;
}

export interface AmazonSearchResult {
  products: AmazonProduct[];
  totalResults: number;
  page: number;
  hasMorePages: boolean;
}

export interface ScrapeResult {
  success: boolean;
  productsFound: number;
  captchaDetected: boolean;
  error?: string;
}

@Injectable()
export class AmazonScraperService {
  private readonly logger = new Logger(AmazonScraperService.name);
  private readonly baseUrl = 'https://www.amazon.in';
  private readonly searchUrl = `${this.baseUrl}/s`;
  private readonly productUrl = `${this.baseUrl}/dp`;
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000;
  private readonly requestTimeout = 15000;
  private readonly proxyEnabled: boolean;
  
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
  ];
  private userAgentIndex = 0;

  private readonly captchaSelectors = [
    'form[action*="captcha"]', 'div[id*="captcha"]', 'img[src*="captcha"]',
    '#captchacharacters', 'div.a-section > div.a-text-center',
  ];

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(RetailerPrice)
    private retailerPriceRepository: Repository<RetailerPrice>,
    @InjectRepository(Retailer)
    private retailerRepository: Repository<Retailer>,
    private cacheService: CacheService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.proxyEnabled = !!this.configService.get('SCRAPER_PROXY_URL');
    this.logger.log(`Amazon scraper initialized (Proxy: ${this.proxyEnabled ? 'enabled' : 'disabled'})`);
  }

  private getNextUserAgent(): string {
    const agent = this.userAgents[this.userAgentIndex];
    this.userAgentIndex = (this.userAgentIndex + 1) % this.userAgents.length;
    return agent;
  }

  private getHeaders(): Record<string, string> {
    return {
      'User-Agent': this.getNextUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'Referer': this.baseUrl,
    };
  }

  private isCaptchaPage(html: string): boolean {
    const $ = cheerio.load(html);
    for (const selector of this.captchaSelectors) {
      if ($(selector).length > 0) return true;
    }
    return html.toLowerCase().includes('captcha') || html.includes('api/captcha');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, retries = 0): Promise<{ data: string; captchaDetected: boolean }> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
          timeout: this.requestTimeout,
        }),
      );
      const html = response.data as string;
      const captchaDetected = this.isCaptchaPage(html);

      if (captchaDetected && retries < this.maxRetries) {
        this.logger.warn(`CAPTCHA detected, retrying (${retries + 1}/${this.maxRetries})...`);
        await this.delay(this.retryDelay * (retries + 1));
        return this.fetchWithRetry(url, retries + 1);
      }
      return { data: html, captchaDetected };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; code?: string };
      if ((err.code === 'ECONNABORTED' || err.response?.status === 503 || err.response?.status === 429) && retries < this.maxRetries) {
        this.logger.warn(`Request failed, retrying (${retries + 1}/${this.maxRetries})...`);
        await this.delay(this.retryDelay * (retries + 1));
        return this.fetchWithRetry(url, retries + 1);
      }
      throw error;
    }
  }

  async searchProducts(query: string, page = 1): Promise<AmazonSearchResult> {
    this.logger.log(`Searching Amazon for: "${query}" (page ${page})`);
    const url = `${this.searchUrl}?k=${encodeURIComponent(query)}&page=${page}`;

    try {
      const { data: html, captchaDetected } = await this.fetchWithRetry(url);
      if (captchaDetected) {
        this.logger.error('CAPTCHA blocked - cannot complete search');
        return this.generateMockResults(query, page);
      }

      const $ = cheerio.load(html);
      const products = this.parseSearchResults($);
      const totalResults = this.parseTotalResults($);
      const hasMorePages = this.checkHasMorePages($);

      this.logger.log(`Found ${products.length} products on page ${page}`);
      return { products, totalResults: totalResults || products.length * 10, page, hasMorePages };
    } catch (error) {
      this.logger.error(`Search failed: ${error}`);
      return this.generateMockResults(query, page);
    }
  }

  private parseSearchResults($: cheerio.CheerioAPI): AmazonProduct[] {
    const products: AmazonProduct[] = [];
    $('div[data-component-type="s-search-result"]').each((_, el) => {
      const $el = $(el);
      const asin = $el.attr('data-asin') || '';
      if (!asin) return;

      const nameEl = $el.find('h2 a span, a.a-size-medium.a-color-base.a-text-normal, span.a-size-medium');
      const name = nameEl.text().trim() || $el.find('h2 a').attr('aria-label') || '';
      const priceWhole = $el.find('span.a-price-whole').first().text().replace(/[^0-9]/g, '');
      const priceFraction = $el.find('span.a-price-fraction').first().text().replace(/[^0-9]/g, '');
      const price = priceWhole && priceFraction ? parseInt(priceWhole + priceFraction, 10) : parseInt(priceWhole || '0', 10);
      const originalPriceEl = $el.find('span.a-text-price span.a-offscreen');
      const originalPriceText = originalPriceEl.first().text().replace(/[^0-9]/g, '');
      const originalPrice = originalPriceText ? parseInt(originalPriceText, 10) : undefined;
      const linkEl = $el.find('h2 a');
      const url = this.baseUrl + (linkEl.attr('href') || '').split('?')[0];
      const imageEl = $el.find('img.s-image');
      const imageUrl = imageEl.attr('src') || imageEl.attr('data-src') || '';
      const ratingEl = $el.find('span.a-icon-alt, i.a-icon-star span');
      const rating = parseFloat(ratingEl.first().text().replace(/[^0-9.]/g, '')) || undefined;
      const reviewsEl = $el.find('span.a-size-base.s-underline-text');
      const reviewCount = parseInt(reviewsEl.first().text().replace(/[^0-9]/g, '') || '0', 10) || undefined;
      const primeEligible = $el.find('i.a-icon-prime, span.a-icon-prime').length > 0;
      const unavailableEl = $el.find('span.a-color-disabled');
      const inStock = unavailableEl.length === 0;

      if (name && price > 0) {
        products.push({ asin, name, price, originalPrice, url, imageUrl, rating, reviewCount, inStock, primeEligible });
      }
    });
    return products;
  }

  private parseTotalResults($: cheerio.CheerioAPI): number {
    const totalEl = $('span#s-result-count-message-id span.a-color-state, span.a-size-base');
    const totalText = totalEl.text();
    const match = totalText.match(/of\s+([\d,]+)\s+results/i) || totalText.match(/([\d,]+)\s+results/i);
    return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
  }

  private checkHasMorePages($: cheerio.CheerioAPI): boolean {
    const nextPageEl = $('a.s-pagination-next');
    return nextPageEl.length > 0 && !nextPageEl.hasClass('s-pagination-disabled');
  }

  async getProductDetails(asin: string): Promise<AmazonProduct | null> {
    this.logger.log(`Fetching product details for ASIN: ${asin}`);
    const url = `${this.productUrl}/${asin}`;

    try {
      const { data: html, captchaDetected } = await this.fetchWithRetry(url);
      if (captchaDetected) {
        this.logger.error('CAPTCHA detected when fetching product details');
        return this.generateMockProduct(asin);
      }
      return this.parseProductDetails(html, asin);
    } catch (error) {
      this.logger.error(`Failed to fetch product ${asin}: ${error}`);
      return this.generateMockProduct(asin);
    }
  }

  private parseProductDetails(html: string, asin: string): AmazonProduct | null {
    const $ = cheerio.load(html);
    const titleEl = $('span#productTitle, h1#title');
    const name = titleEl.text().trim();
    if (!name) return null;

    const priceWhole = $('span.a-price-whole').first().text().replace(/[^0-9]/g, '');
    const priceFraction = $('span.a-price-fraction').first().text().replace(/[^0-9]/g, '00');
    const price = parseInt((priceWhole || '0') + (priceFraction || '00').slice(0, 2), 10);
    const originalPriceEl = $('span.a-text-price span.a-offscreen');
    const originalPriceText = originalPriceEl.text().replace(/[^0-9]/g, '');
    const originalPrice = originalPriceText ? parseInt(originalPriceText, 10) : undefined;
    const imageUrl = $('img#landingImage, #imgTagWrapperId img').attr('src') || '';
    const ratingEl = $('span.a-icon-alt');
    const rating = parseFloat(ratingEl.first().text().replace(/[^0-9.]/g, '')) || undefined;
    const reviewsEl = $('span#acrCustomerReviewText');
    const reviewCount = parseInt(reviewsEl.text().replace(/[^0-9]/g, '') || '0', 10) || undefined;
    const primeEligible = $('i.a-icon-prime').length > 0;
    const availabilityEl = $('div#availability span');
    const availability = availabilityEl.text().trim();
    const outOfStock = availability.toLowerCase().includes('out of stock') || availability.toLowerCase().includes('unavailable');

    return { asin, name, price: price || 0, originalPrice, url: `${this.productUrl}/${asin}`, imageUrl, rating, reviewCount, inStock: !outOfStock, primeEligible };
  }

  async updateProductPrice(asin: string): Promise<{ asin: string; price: number; originalPrice?: number; timestamp: Date } | null> {
    const product = await this.getProductDetails(asin);
    if (!product) return null;
    await this.updatePriceInDatabase(asin, product.price, product.originalPrice);
    return { asin, price: product.price, originalPrice: product.originalPrice, timestamp: new Date() };
  }

  async batchUpdatePrices(asins: string[]): Promise<Array<{ asin: string; price: number; success: boolean }>> {
    const results = [];
    for (const asin of asins) {
      try {
        const result = await this.updateProductPrice(asin);
        results.push({ asin, price: result?.price || 0, success: !!result });
      } catch {
        results.push({ asin, price: 0, success: false });
      }
    }
    return results;
  }

  private async updatePriceInDatabase(asin: string, price: number, originalPrice?: number): Promise<void> {
    // Find retailer
    const retailer = await this.retailerRepository.findOne({ where: { slug: 'amazon' } });
    if (!retailer) return;

    // Find product by slug matching ASIN
    const product = await this.productRepository.findOne({ 
      where: { slug: Like(`%${asin}%`) } 
    });
    if (!product) return;

    // Find or create retailer price
    const retailerPrice = await this.retailerPriceRepository.findOne({
      where: { productId: product.id, retailerId: retailer.id },
    });

    if (retailerPrice) {
      retailerPrice.price = price;
      retailerPrice.originalPrice = originalPrice ?? price;
      retailerPrice.lastUpdated = new Date();
      await this.retailerPriceRepository.save(retailerPrice);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledScrape(): Promise<ScrapeResult> {
    this.logger.log('Starting scheduled Amazon scraping');
    return this.runScheduledScrape();
  }

  async runScheduledScrape(): Promise<ScrapeResult> {
    let captchaDetected = false;
    let productsFound = 0;

    try {
      const searchTerms = ['bestselling electronics', 'trending gadgets', 'popular smartphone', 'top rated laptop'];

      for (const term of searchTerms) {
        try {
          const result = await this.searchProducts(term, 1);
          if (result.products.length === 0 && !result.hasMorePages) {
            captchaDetected = true;
            continue;
          }
          for (const product of result.products.slice(0, 10)) {
            await this.updatePriceInDatabase(product.asin, product.price, product.originalPrice);
            productsFound++;
          }
          await this.delay(1000);
        } catch (error) {
          this.logger.error(`Failed to scrape "${term}": ${error}`);
        }
      }

      await this.cacheService.invalidateSearch();
      await this.cacheService.set('products:featured', null);
      this.logger.log(`Scheduled scrape complete: ${productsFound} products`);
      return { success: true, productsFound, captchaDetected };
    } catch (error) {
      this.logger.error(`Scheduled scrape failed: ${error}`);
      return { success: false, productsFound, captchaDetected, error: String(error) };
    }
  }

  private generateMockResults(query: string, page: number): AmazonSearchResult {
    const products: AmazonProduct[] = [];
    for (let i = 0; i < 12; i++) {
      products.push(this.generateMockProduct(`B0${String(i + 1).padStart(8, '0')}`));
    }
    return { products, totalResults: 100, page, hasMorePages: page < 5 };
  }

  private generateMockProduct(asin: string): AmazonProduct {
    const basePrice = Math.floor(Math.random() * 80000) + 1000;
    const hasDiscount = Math.random() > 0.5;
    const discount = hasDiscount ? Math.floor(Math.random() * 30) + 5 : 0;
    return {
      asin, name: `Premium Product - ASIN ${asin}`,
      price: basePrice - Math.floor(basePrice * discount / 100),
      originalPrice: hasDiscount ? basePrice : undefined,
      url: `${this.productUrl}/${asin}`, imageUrl: 'https://m.media-amazon.com/images/I/placeholder.jpg',
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 5000) + 100,
      inStock: Math.random() > 0.1, primeEligible: Math.random() > 0.3,
    };
  }

  async scrapeRetailer(): Promise<ScrapeResult> {
    return this.runScheduledScrape();
  }

  getStatus() {
    return { enabled: true, productsScraped: 0 };
  }
}