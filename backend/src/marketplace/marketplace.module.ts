import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { AgentMarketplace } from './entities/agent-marketplace.entity';
import { AgentReview } from './entities/agent-review.entity';
import { AgentInstallation } from './entities/agent-installation.entity';
import { Agent } from '../kernel/entities/agent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentMarketplace,
      AgentReview,
      AgentInstallation,
      Agent,
    ]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
