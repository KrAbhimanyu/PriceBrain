import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { SearchModule } from './search/search.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CompareModule } from './comparison/comparison.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { PriceHistoryModule } from './price-history/price-history.module';
import { CouponsModule } from './coupons/coupons.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { CacheModule } from './cache/cache.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ScraperModule } from './scraper/scraper.module';
import { QueueModule } from './queue/queue.module';
import { AiModule } from './ai/ai.module';
// Phase 6 - Autonomous Commerce Intelligence Platform
import { MissionsModule } from './missions/missions.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { PoliciesModule } from './policies/policies.module';
import { AutomationModule } from './automation/automation.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PluginsModule } from './plugins/plugins.module';
import { ExecutionModule } from './execution/execution.module';
import { DecisionModule } from './decision/decision.module';
// Phase 7 - AI Commerce Operating System (AI-COS)
import { KernelModule } from './kernel/kernel.module';
import { EventMeshModule } from './event-mesh/event-mesh.module';
import { ToolBusModule } from './tool-bus/tool-bus.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
// Phase 8 - AI Organization Operating System (AI-OOS)
import { ExecutiveModule } from './executive/executive.module';
import { DigitalTwinModule } from './digital-twin/digital-twin.module';
import { SimulationModule } from './simulation/simulation.module';
import { ConstitutionModule } from './constitution/constitution.module';
import { GovernanceModule } from './governance/governance.module';
import { EnterpriseMemoryModule } from './enterprise-memory/enterprise-memory.module';
import { OrganizationAnalyticsModule } from './organization-analytics/organization-analytics.module';
// Common
import { ObservabilityModule } from './common/observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'password'),
        database: configService.get('DATABASE_NAME', 'pricebrain'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // NEVER synchronize in production - use migrations only
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development' ? ['query', 'error', 'warn'] : ['error'],
        migrationsRun: true, // Run migrations on startup
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    CacheModule,
    ElasticsearchModule,
    QueueModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    SearchModule,
    WishlistModule,
    CompareModule,
    AffiliateModule,
    PriceHistoryModule,
    CouponsModule,
    NotificationsModule,
    AdminModule,
    HealthModule,
    AnalyticsModule,
    ScraperModule,
    AiModule,
    // Phase 6 Modules
    MissionsModule,
    WorkflowsModule,
    ApprovalsModule,
    PoliciesModule,
    AutomationModule,
    MonitoringModule,
    PluginsModule,
    ExecutionModule,
    DecisionModule,
    // Phase 7 Modules - AI Commerce Operating System
    KernelModule,
    EventMeshModule,
    ToolBusModule,
    MarketplaceModule,
    EnterpriseModule,
    // Phase 8 Modules - AI Organization Operating System
    ExecutiveModule,
    DigitalTwinModule,
    SimulationModule,
    ConstitutionModule,
    GovernanceModule,
    EnterpriseMemoryModule,
    OrganizationAnalyticsModule,
    // Observability
    ObservabilityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
