import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';

@Module({
  imports: [],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
