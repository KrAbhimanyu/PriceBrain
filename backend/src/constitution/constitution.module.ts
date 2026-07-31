import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConstitutionRule, ConstitutionViolation } from './entities/constitution.entity';
import { ConstitutionService } from './constitution.service';
import { ConstitutionController } from './constitution.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConstitutionRule, ConstitutionViolation]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ConstitutionController],
  providers: [ConstitutionService],
  exports: [ConstitutionService],
})
export class ConstitutionModule {}
