import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PluginsService } from './plugins.service';
import { PluginsController } from './plugins.controller';
import { Plugin } from './entities/plugin.entity';
import { UserPlugin } from './entities/user-plugin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plugin, UserPlugin])],
  controllers: [PluginsController],
  providers: [PluginsService],
  exports: [PluginsService],
})
export class PluginsModule {}
