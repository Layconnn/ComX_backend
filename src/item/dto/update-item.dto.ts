import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateItemDto {
  @ApiProperty({
    description: 'The updated name of the item',
    example: 'Gaming Laptop Pro',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The updated description of the item',
    example: 'An upgraded high-performance gaming laptop with improved cooling',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
