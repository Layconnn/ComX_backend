import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { BusinessType } from '@prisma/client'; // assuming you use Prisma's generated enum

export class UpdateSettingsDto {
  @ApiProperty({
    description:
      'For individual users: full name (first and last name). For corporate users: company name.',
    example: 'John Doe or Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: "User's email address",
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number (only for individual users)',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Preferred theme',
    example: 'light',
  })
  @IsOptional()
  @IsString()
  theme?: string;

  // Fields for corporate users:
  @ApiPropertyOptional({
    description: 'Business type for corporate users',
    example: 'RETAIL',
    enum: BusinessType,
  })
  @IsOptional()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  @ApiPropertyOptional({
    description: 'Date of incorporation for corporate users (ISO date format)',
    example: '2020-01-01',
  })
  @IsOptional()
  @IsString()
  dateOfIncorporation?: string;
}
