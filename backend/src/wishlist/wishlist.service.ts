import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private wishlistRepository: Repository<WishlistItem>,
  ) {}

  async findAll(userId: string) {
    return this.wishlistRepository.find({
      where: { userId },
      relations: ['product', 'product.images', 'product.retailerPrices'],
      order: { createdAt: 'DESC' },
    });
  }

  async add(userId: string, productId: string, targetPrice?: number) {
    const existing = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    
    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }

    const item = this.wishlistRepository.create({
      userId,
      productId,
      targetPrice,
    });
    
    return this.wishlistRepository.save(item);
  }

  async remove(userId: string, productId: string) {
    const item = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    
    if (!item) {
      throw new NotFoundException('Item not found in wishlist');
    }
    
    await this.wishlistRepository.remove(item);
    return { success: true };
  }

  async updateTargetPrice(userId: string, productId: string, targetPrice: number) {
    const item = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    
    if (!item) {
      throw new NotFoundException('Item not found in wishlist');
    }
    
    item.targetPrice = targetPrice;
    return this.wishlistRepository.save(item);
  }

  async togglePriceAlert(userId: string, productId: string) {
    const item = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    
    if (!item) {
      throw new NotFoundException('Item not found in wishlist');
    }
    
    item.priceAlert = !item.priceAlert;
    return this.wishlistRepository.save(item);
  }
}
