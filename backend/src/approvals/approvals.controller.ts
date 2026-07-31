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
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto, ApproveDto, RejectDto, QueryApprovalsDto } from './dto/approval.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new approval request' })
  create(@Request() req, @Body() dto: CreateApprovalDto) {
    return this.approvalsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all approvals' })
  findAll(@Request() req, @Query() query: QueryApprovalsDto) {
    return this.approvalsService.findAll(req.user.id, query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending approvals' })
  findPending(@Request() req) {
    return this.approvalsService.findPending(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get approval statistics' })
  getStats(@Request() req) {
    return this.approvalsService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific approval' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.approvalsService.findOne(id, req.user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a request' })
  approve(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ApproveDto,
  ) {
    return this.approvalsService.approve(id, req.user.id, dto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a request' })
  reject(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RejectDto,
  ) {
    return this.approvalsService.reject(id, req.user.id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending request' })
  cancel(@Request() req, @Param('id') id: string) {
    return this.approvalsService.cancel(id, req.user.id);
  }
}
