import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';
import { CreateSimulationDto, UpdateSimulationDto, QuerySimulationsDto, CreateScenarioDto } from './dto/simulation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Simulation Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('simulations')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post()
  @ApiOperation({ summary: 'Create simulation' })
  create(@Request() req, @Body() dto: CreateSimulationDto) {
    return this.simulationService.create(req.user.id, dto);
  }

  @Get(':organizationId')
  @ApiOperation({ summary: 'Get organization simulations' })
  findAll(
    @Param('organizationId') organizationId: string,
    @Query() query: QuerySimulationsDto,
  ) {
    return this.simulationService.findAll(organizationId, query);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Get simulation details' })
  findById(@Param('id') id: string) {
    return this.simulationService.findById(id);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run simulation' })
  run(@Param('id') id: string) {
    return this.simulationService.runSimulation(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update simulation' })
  update(@Param('id') id: string, @Body() dto: UpdateSimulationDto) {
    return this.simulationService.update(id, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve simulation' })
  approve(@Param('id') id: string, @Request() req) {
    return this.simulationService.approve(id, req.user.id);
  }

  @Post(':id/scenarios')
  @ApiOperation({ summary: 'Add scenario' })
  addScenario(@Param('id') id: string, @Body() dto: CreateScenarioDto) {
    return this.simulationService.addScenario(id, dto);
  }

  @Get(':id/scenarios')
  @ApiOperation({ summary: 'Get scenarios' })
  getScenarios(@Param('id') id: string) {
    return this.simulationService.getScenarios(id);
  }
}
