import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMarketDto {
  @ApiProperty({ description: 'Market name', example: 'NASDAQ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Market description',
    example: 'Overview of the tech market',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Current price', example: 15000 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Percentage change', example: 1.23 })
  @IsNumber()
  change: number;
}
