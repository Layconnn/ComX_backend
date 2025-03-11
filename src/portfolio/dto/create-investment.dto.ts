import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateInvestmentDto {
  @ApiProperty({ description: 'Name of the investment', example: 'Apple Inc.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Quantity of shares', example: 10 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Value per share', example: 150 })
  @IsNumber()
  value: number;
}
