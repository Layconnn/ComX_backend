import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    description: 'The name of the item',
    example: 'Laptop',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'A brief description of the item',
    example: 'A high-performance gaming laptop',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
