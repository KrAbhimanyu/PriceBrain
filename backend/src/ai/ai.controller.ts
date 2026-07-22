import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiShoppingService } from './ai-shopping.service';
import { AiChatService } from './ai-chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiShoppingService: AiShoppingService,
    private readonly aiChatService: AiChatService,
  ) {}

  // ============ Shopping Features (Public) ============

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Natural language product search' })
  async searchProducts(@Query('q') query: string) {
    return this.aiShoppingService.searchProducts(query);
  }

  @Post('compare')
  @Public()
  @ApiOperation({ summary: 'Compare multiple products' })
  async compareProducts(@Body() body: { productIds: string[] }) {
    return this.aiShoppingService.compareProducts(body.productIds);
  }

  @Get('recommend/:productId')
  @Public()
  @ApiOperation({ summary: 'Get buy now/wait recommendation' })
  async getBuyRecommendation(@Param('productId') productId: string) {
    return this.aiShoppingService.getBuyRecommendation(productId);
  }

  @Get('alternatives/:productId')
  @Public()
  @ApiOperation({ summary: 'Get alternative products' })
  async getAlternatives(@Param('productId') productId: string, @Query('limit') limit?: number) {
    return this.aiShoppingService.getAlternatives(productId, limit || 5);
  }

  // ============ Chat Features (Protected) ============

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user chat conversations' })
  async getConversations(@CurrentUser() user: User) {
    return this.aiChatService.getConversationsWithLastMessage(user.id);
  }

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new conversation' })
  async createConversation(
    @CurrentUser() user: User,
    @Body() body: { title?: string; context?: string; type?: string },
  ) {
    return this.aiChatService.createConversation(user.id, body.title, body.context, body.type);
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get conversation with messages' })
  async getConversation(@Param('id') id: string, @CurrentUser() user: User) {
    return this.aiChatService.getConversation(id, user.id);
  }

  @Delete('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a conversation' })
  async deleteConversation(@Param('id') id: string, @CurrentUser() user: User) {
    await this.aiChatService.deleteConversation(id, user.id);
    return { success: true };
  }

  @Post('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message in a conversation' })
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body: { content: string },
  ) {
    return this.aiChatService.sendMessage(id, user.id, body.content);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get message history' })
  async getMessages(@Param('id') id: string, @CurrentUser() user: User) {
    return this.aiChatService.getMessageHistory(id);
  }

  @Delete('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear message history' })
  async clearHistory(@Param('id') id: string, @CurrentUser() user: User) {
    await this.aiChatService.clearHistory(id, user.id);
    return { success: true };
  }
}
