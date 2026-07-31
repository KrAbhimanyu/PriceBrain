import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationService } from './simulation.service';
import { SimulationController } from './simulation.controller';
import { Simulation, SimulationScenario } from './entities/simulation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Simulation, SimulationScenario])],
  controllers: [SimulationController],
  providers: [SimulationService],
  exports: [SimulationService],
})
export class SimulationModule {}
