import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RetailerPrice } from '../products/entities/retailer-price.entity';
import { ClickTracking } from './entities/click-tracking.entity';
import { RETAILERS } from '../shared/constants';

interface AffiliateConfig {
  urlPattern: string;
  params: Record<string, string>;
}

@Injectable()
export class AffiliateService {
  private readonly affiliateConfigs: Map<string, AffiliateConfig>;

  constructor(
    @InjectRepository(RetailerPrice)
    private retailerPriceRepository: Repository<RetailerPrice>,
    @InjectRepository(ClickTracking)
    private clickTrackingRepository: Repository<ClickTracking>,
    private configService: ConfigService,
  ) {
    // Initialize affiliate configs for each retailer
    const configs: [string, AffiliateConfig][] = [
      [RETAILERS.AMAZON, {
        urlPattern: 'https://www.amazon.in/dp/{ASIN}',
        params: { 'tag': this.configService.get<string>('AMAZON_ASSOCIATE_TAG') || '' },
      }],
      [RETAILERS.FLIPKART, {
        urlPattern: 'https://www.flipkart.com/product/p/?pid={PID}',
        params: { 'affid': this.configService.get<string>('FLIPKART_AFFILIATE_ID') || '' },
      }],
      [RETAILERS.MYNTRA, {
        urlPattern: 'https://www.myntra.com/{SLUG}',
        params: {},
      }],
      [RETAILERS.AJIO, {
        urlPattern: 'https://www.ajio.com/product/{PID}',
        params: {},
      }],
      [RETAILERS.CROMA, {
        urlPattern: 'https://www.croma.com/product/{PID}',
        params: {},
      }],
      [RETAILERS.TATACLIQ, {
        urlPattern: 'https://www.tatacliq.com/product/{PID}',
        params: {},
      }],
      [RETAILERS.RELIANCE, {
        urlPattern: 'https://www.reliancedigital.in/product/{PID}',
        params: {},
      }],
      [RETAILERS.NYKAA, {
        urlPattern: 'https://www.nykaa.com/product/{PID}',
        params: {},
      }],
    ];
    
    this.affiliateConfigs = new Map(configs);
  }

  async generateAffiliateLink(
    retailerPriceId: string, 
    userId?: string, 
    ipAddress?: string, 
    userAgent?: string
  ) {
    const retailerPrice = await this.retailerPriceRepository.findOne({
      where: { id: retailerPriceId },
      relations: ['retailer'],
    });

    if (!retailerPrice) {
      throw new NotFoundException('Retailer price not found');
    }

    const retailerSlug = retailerPrice.retailer.slug.toLowerCase();
    const affiliateConfig = this.affiliateConfigs.get(retailerSlug);

    // Use the retailerPrice ID as the product reference since we may not have external IDs
    const productReference = retailerPrice.id;

    let redirectUrl: string;

    if (affiliateConfig) {
      // Build affiliate URL with the product reference
      const url = affiliateConfig.urlPattern
        .replace('{ASIN}', productReference)
        .replace('{PID}', productReference)
        .replace('{SLUG}', productReference);

      // Add affiliate parameters if configured
      const params = new URLSearchParams();
      Object.entries(affiliateConfig.params).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const queryString = params.toString();
      redirectUrl = queryString ? `${url}?${queryString}` : url;
    } else if (retailerPrice.affiliateUrl) {
      // Use existing affiliate URL if available
      redirectUrl = retailerPrice.affiliateUrl;
    } else if (retailerPrice.productUrl) {
      // Fallback to product URL
      redirectUrl = retailerPrice.productUrl;
    } else {
      throw new NotFoundException('No affiliate link available');
    }

    // Track the click
    const clickRecord = this.clickTrackingRepository.create({
      productId: retailerPrice.productId,
      retailerId: retailerPrice.retailerId,
      userId: userId || undefined,
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
    });
    await this.clickTrackingRepository.save(clickRecord);

    return {
      redirectUrl,
      retailer: retailerPrice.retailer.name,
      retailerSlug: retailerPrice.retailer.slug,
      price: retailerPrice.price,
      originalPrice: retailerPrice.originalPrice,
      clickId: clickRecord.id,
    };
  }

  async redirect(
    retailerPriceId: string, 
    userId?: string, 
    ipAddress?: string, 
    userAgent?: string
  ) {
    return this.generateAffiliateLink(retailerPriceId, userId, ipAddress, userAgent);
  }

  async getClickStats(productId?: string, retailerId?: string, days?: number) {
    const where: Record<string, unknown> = {};
    
    if (productId) where.productId = productId;
    if (retailerId) where.retailerId = retailerId;
    
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      where.createdAt = startDate;
    }

    const clicks = await this.clickTrackingRepository.count({ where });
    
    return {
      totalClicks: clicks,
      productId,
      retailerId,
      period: days ? `${days} days` : 'all time',
    };
  }

  getSupportedRetailers() {
    return Array.from(this.affiliateConfigs.keys()).map(slug => ({
      slug,
      name: this.formatRetailerName(slug),
      hasAffiliateSupport: this.affiliateConfigs.get(slug)?.params 
        ? Object.keys(this.affiliateConfigs.get(slug)!.params).length > 0 
        : false,
    }));
  }

  private formatRetailerName(slug: string): string {
    const names: Record<string, string> = {
      amazon: 'Amazon',
      flipkart: 'Flipkart',
      myntra: 'Myntra',
      ajio: 'Ajio',
      croma: 'Croma',
      tatacliq: 'Tata CLiQ',
      reliance: 'Reliance Digital',
      nykaa: 'Nykaa',
    };
    return names[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
  }
}
