import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompareService } from './compare.service';

@ApiTags('compare')
@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Post()
  @ApiOperation({ summary: 'Compare multiple products' })
  async compare(@Body() body: { productIds: string[] }) {
    return this.compareService.compare(body.productIds);
  }
}
