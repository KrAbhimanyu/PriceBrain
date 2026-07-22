import { Module, Global } from '@nestjs/common';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchService } from './elasticsearch.service';
import { ProductSearchService } from './product-search.service';

@Global()
@Module({
  imports: [
    NestElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const username = configService.get<string>('ELASTICSEARCH_USERNAME');
        const password = configService.get<string>('ELASTICSEARCH_PASSWORD');
        
        return {
          node: configService.get('ELASTICSEARCH_NODE', 'http://localhost:9200'),
          auth: username && password
            ? { username, password }
            : undefined,
        };
      },
    }),
  ],
  providers: [ElasticsearchService, ProductSearchService],
  exports: [ElasticsearchService, ProductSearchService],
})
export class ElasticsearchModule {}
