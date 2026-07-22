import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { Retailer } from './entities/retailer.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
    @InjectRepository(Retailer)
    private retailersRepository: Repository<Retailer>,
    private cacheService: CacheService,
  ) {}

  async findAllBrands() {
    // Check cache first
    const cached = await this.cacheService.getBrands();
    if (cached) {
      return cached;
    }

    const brands = await this.brandsRepository.find({
      where: { isActive: true },
      order: { productCount: 'DESC' },
    });

    // Cache brands
    if (brands.length > 0) {
      await this.cacheService.setBrands(brands, 86400);
    }

    return brands;
  }

  async findAllRetailers() {
    // Check cache first
    const cached = await this.cacheService.getRetailers();
    if (cached) {
      return cached;
    }

    const retailers = await this.retailersRepository.find({
      where: { isActive: true },
    });

    // Cache retailers
    if (retailers.length > 0) {
      await this.cacheService.setRetailers(retailers, 86400);
    }

    return retailers;
  }
}
