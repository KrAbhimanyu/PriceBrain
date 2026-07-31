import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto, UpdatePolicyDto, EvaluateContextDto } from './dto/policy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PolicyType } from '../shared/enums/mission.enum';

@ApiTags('Policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new policy' })
  create(@Request() req, @Body() dto: CreatePolicyDto) {
    return this.policiesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all policies' })
  findAll(
    @Request() req,
    @Query('type') type?: PolicyType,
  ) {
    return this.policiesService.findAll(req.user.id, type);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active policies' })
  findActive(@Request() req) {
    return this.policiesService.findActive(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get policy statistics' })
  getStats(@Request() req) {
    return this.policiesService.getStats(req.user.id);
  }

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate context against policies' })
  evaluate(@Request() req, @Body() dto: EvaluateContextDto) {
    return this.policiesService.evaluate(req.user.id, dto.context);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific policy' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.policiesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a policy' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdatePolicyDto,
  ) {
    return this.policiesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a policy' })
  delete(@Request() req, @Param('id') id: string) {
    return this.policiesService.delete(id, req.user.id);
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Toggle policy active status' })
  toggle(@Request() req, @Param('id') id: string) {
    return this.policiesService.toggle(id, req.user.id);
  }

  @Post('defaults')
  @ApiOperation({ summary: 'Create default policies' })
  createDefaults(@Request() req) {
    return this.policiesService.createDefaultPolicies(req.user.id);
  }
}
