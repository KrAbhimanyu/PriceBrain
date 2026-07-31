import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DigitalTwinService } from './digital-twin.service';
import {
  CreateDigitalTwinDto,
  UpdateDigitalTwinDto,
  SyncDigitalTwinDto,
  UpdateTwinComponentDto,
} from './dto/digital-twin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Digital Twin Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('digital-twin')
export class DigitalTwinController {
  constructor(private readonly digitalTwinService: DigitalTwinService) {}

  @Post()
  @ApiOperation({ summary: 'Create digital twin' })
  create(@Body() dto: CreateDigitalTwinDto) {
    return this.digitalTwinService.create(dto);
  }

  @Get(':organizationId')
  @ApiOperation({ summary: 'Get digital twin' })
  findByOrganization(@Param('organizationId') organizationId: string) {
    return this.digitalTwinService.findByOrganization(organizationId);
  }

  @Patch(':organizationId')
  @ApiOperation({ summary: 'Update digital twin' })
  update(
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateDigitalTwinDto,
  ) {
    return this.digitalTwinService.update(organizationId, dto);
  }

  @Post(':organizationId/sync')
  @ApiOperation({ summary: 'Sync digital twin' })
  sync(
    @Param('organizationId') organizationId: string,
    @Body() dto: SyncDigitalTwinDto,
  ) {
    return this.digitalTwinService.sync(organizationId, dto);
  }

  @Get(':organizationId/status')
  @ApiOperation({ summary: 'Get digital twin status' })
  getStatus(@Param('organizationId') organizationId: string) {
    return this.digitalTwinService.getDigitalTwinStatus(organizationId);
  }

  @Get(':organizationId/components')
  @ApiOperation({ summary: 'Get twin components' })
  getComponents(@Param('organizationId') organizationId: string) {
    return this.digitalTwinService.getComponents(organizationId);
  }

  @Patch(':organizationId/components/:type/:id')
  @ApiOperation({ summary: 'Update twin component' })
  updateComponent(
    @Param('organizationId') organizationId: string,
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() dto: UpdateTwinComponentDto,
  ) {
    return this.digitalTwinService.updateComponent(organizationId, type, id, dto);
  }

  @Post(':organizationId/snapshots')
  @ApiOperation({ summary: 'Create snapshot' })
  createSnapshot(@Param('organizationId') organizationId: string) {
    return this.digitalTwinService.createSnapshot(organizationId);
  }

  @Get(':organizationId/snapshots')
  @ApiOperation({ summary: 'Get snapshots' })
  getSnapshots(
    @Param('organizationId') organizationId: string,
  ) {
    return this.digitalTwinService.getSnapshots(organizationId);
  }

  @Get('snapshots/compare/:id1/:id2')
  @ApiOperation({ summary: 'Compare snapshots' })
  compareSnapshots(
    @Param('id1') id1: string,
    @Param('id2') id2: string,
  ) {
    return this.digitalTwinService.compareSnapshots(id1, id2);
  }
}
