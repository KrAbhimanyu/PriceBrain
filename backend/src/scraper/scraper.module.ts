import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScraperService } from './scraper.service';
import { AmazonScraperService } from './amazon-scraper.service';
import { ScraperController } from './scraper.controller';
import { Product } from '../products/entities/product.entity';
import { RetailerPrice } from '../products/entities/retailer-price.entity';
import { Retailer } from '../brands/entities/retailer.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Product, RetailerPrice, Retailer]),
    HttpModule,
    CacheModule,
  ],
  controllers: [ScraperController],
  providers: [ScraperService, AmazonScraperService],
  exports: [ScraperService, AmazonScraperService],
})
export class ScraperModule {}
