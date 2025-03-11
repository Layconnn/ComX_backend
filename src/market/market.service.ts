import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';

@Injectable()
export class MarketService {
  private marketData = [
    {
      id: 1,
      name: 'NASDAQ',
      description: 'US tech stocks',
      price: 15000,
      change: 1.2,
    },
    {
      id: 2,
      name: 'Dow Jones',
      description: 'US industrials',
      price: 35000,
      change: -0.5,
    },
    {
      id: 3,
      name: 'S&P 500',
      description: 'US large cap stocks',
      price: 4500,
      change: 0.8,
    },
  ];

  create(createMarketDto: CreateMarketDto) {
    const newMarket = { id: this.marketData.length + 1, ...createMarketDto };
    this.marketData.push(newMarket);
    return newMarket;
  }

  findAll() {
    return this.marketData;
  }

  update(id: number, updateMarketDto: UpdateMarketDto) {
    const index = this.marketData.findIndex((m) => m.id === id);
    if (index === -1)
      throw new NotFoundException(`Market with id ${id} not found`);
    this.marketData[index] = { ...this.marketData[index], ...updateMarketDto };
    return this.marketData[index];
  }

  remove(id: number) {
    const index = this.marketData.findIndex((m) => m.id === id);
    if (index === -1)
      throw new NotFoundException(`Market with id ${id} not found`);
    return this.marketData.splice(index, 1)[0];
  }
}
