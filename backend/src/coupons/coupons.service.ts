import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepository: Repository<Coupon>,
  ) {}

  async findAll(retailerId?: string) {
    const queryBuilder = this.couponsRepository.createQueryBuilder('coupon')
      .where('coupon.isActive = :isActive', { isActive: true });

    if (retailerId) {
      queryBuilder.andWhere('coupon.retailerId = :retailerId', { retailerId });
    }

    return queryBuilder.orderBy('coupon.expiresAt', 'ASC').getMany();
  }

  async findOne(code: string) {
    const coupon = await this.couponsRepository.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Check if expired
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new NotFoundException('Coupon has expired');
    }

    // Check if not started
    if (coupon.startsAt && coupon.startsAt > new Date()) {
      throw new NotFoundException('Coupon is not yet active');
    }

    return coupon;
  }

  async validate(code: string, purchaseAmount: number) {
    const coupon = await this.findOne(code);

    if (coupon.minPurchase && purchaseAmount < coupon.minPurchase) {
      return {
        valid: false,
        message: `Minimum purchase of ₹${coupon.minPurchase} required`,
      };
    }

    let discount = coupon.type === 'percentage' 
      ? (purchaseAmount * Number(coupon.value)) / 100
      : Number(coupon.value);

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    return {
      valid: true,
      discount: Math.round(discount),
      coupon,
    };
  }
}
