import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminGuard } from './guards/admin.guard';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get admin dashboard data' })
  async getDashboard() {
    return {
      stats: {
        totalProducts: 0,
        totalUsers: 0,
        totalRetailers: 0,
        totalRevenue: 0,
      },
    };
  }
}
