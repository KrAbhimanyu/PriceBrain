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
import { EventMeshService } from './event-mesh.service';
import {
  PublishEventDto,
  CreateEventTypeDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  QueryEventsDto,
} from './dto/event-mesh.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Event Mesh')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventMeshController {
  constructor(private readonly eventMeshService: EventMeshService) {}

  // ============ Event Publishing ============

  @Post()
  @ApiOperation({ summary: 'Publish an event' })
  publish(@Body() dto: PublishEventDto) {
    return this.eventMeshService.publish(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Query events' })
  findEvents(@Query() query: QueryEventsDto) {
    return this.eventMeshService.findEvents(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get event statistics' })
  getStats(@Query('days') days?: number) {
    return this.eventMeshService.getEventStats(days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  getEvent(@Param('id') id: string) {
    return this.eventMeshService.getEvent(id);
  }

  @Post(':id/replay')
  @ApiOperation({ summary: 'Replay an event' })
  replayEvent(@Param('id') id: string) {
    return this.eventMeshService.replayEvent(id);
  }

  // ============ Event Types ============

  @Get('types/all')
  @ApiOperation({ summary: 'Get all event types' })
  findEventTypes(@Query('category') category?: string) {
    return this.eventMeshService.findEventTypes(category);
  }

  @Post('types')
  @ApiOperation({ summary: 'Create an event type' })
  createEventType(@Body() dto: CreateEventTypeDto) {
    return this.eventMeshService.createEventType(dto);
  }

  // ============ Subscriptions ============

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create a subscription' })
  createSubscription(@Request() req, @Body() dto: CreateSubscriptionDto) {
    return this.eventMeshService.createSubscription(req.user.id, dto);
  }

  @Get('subscriptions/mine')
  @ApiOperation({ summary: 'Get my subscriptions' })
  findMySubscriptions(@Request() req) {
    return this.eventMeshService.findSubscriptions(req.user.id);
  }

  @Patch('subscriptions/:id')
  @ApiOperation({ summary: 'Update a subscription' })
  updateSubscription(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.eventMeshService.updateSubscription(id, req.user.id, dto);
  }

  @Delete('subscriptions/:id')
  @ApiOperation({ summary: 'Delete a subscription' })
  deleteSubscription(@Request() req, @Param('id') id: string) {
    return this.eventMeshService.deleteSubscription(id, req.user.id);
  }

  @Post('subscriptions/:id/toggle')
  @ApiOperation({ summary: 'Toggle subscription active status' })
  toggleSubscription(@Request() req, @Param('id') id: string) {
    return this.eventMeshService.toggleSubscription(id, req.user.id);
  }
}
