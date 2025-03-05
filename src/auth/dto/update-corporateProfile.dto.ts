import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCorporateProfileDto {
  @ApiProperty({
    description: 'The name of the company',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'The business type of the company',
    example: 'RETAIL',
  })
  @IsString()
  @IsNotEmpty()
  businessType: string;

  @ApiProperty({
    description: 'The date of incorporation in ISO format (YYYY-MM-DD)',
    example: '2020-01-01',
  })
  @IsString()
  @IsNotEmpty()
  dateOfIncorporation: string;

  @ApiProperty({
    description: 'Password for updating the profile',
    example: 'mySecurePassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
