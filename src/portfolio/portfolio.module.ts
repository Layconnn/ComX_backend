import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';

@Module({
  imports: [],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
