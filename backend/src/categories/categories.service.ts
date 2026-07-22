import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private cacheService: CacheService,
  ) {}

  async findAll() {
    // Check cache first
    const cached = await this.cacheService.getCategories();
    if (cached) {
      return cached;
    }

    const categories = await this.categoriesRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    // Cache categories
    if (categories.length > 0) {
      await this.cacheService.setCategories(categories, 86400);
    }

    return categories;
  }

  async findOne(slug: string) {
    return this.categoriesRepository.findOne({
      where: { slug, isActive: true },
    });
  }
}
