import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalTwinService } from './digital-twin.service';
import { DigitalTwinController } from './digital-twin.controller';
import { DigitalTwin, TwinComponent, TwinSnapshot } from './entities/digital-twin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DigitalTwin, TwinComponent, TwinSnapshot])],
  controllers: [DigitalTwinController],
  providers: [DigitalTwinService],
  exports: [DigitalTwinService],
})
export class DigitalTwinModule {}
