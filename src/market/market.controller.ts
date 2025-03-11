import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('market')
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get()
  @ApiOperation({ summary: 'Get all market data' })
  findAll() {
    return this.marketService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create market data (admin only)' })
  create(@Body() createMarketDto: CreateMarketDto) {
    return this.marketService.create(createMarketDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update market data (admin only)' })
  update(@Param('id') id: string, @Body() updateMarketDto: UpdateMarketDto) {
    return this.marketService.update(Number(id), updateMarketDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete market data (admin only)' })
  remove(@Param('id') id: string) {
    return this.marketService.remove(Number(id));
  }
}
