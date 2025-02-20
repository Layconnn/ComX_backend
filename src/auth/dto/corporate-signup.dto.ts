import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { BusinessType as PrismaBusinessType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CorporateSignupDto {
  @ApiProperty({ example: 'Acme Inc', description: 'The company name' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    example: PrismaBusinessType.SERVICE,
    description: 'Type of business',
  })
  @IsEnum(PrismaBusinessType as object)
  @IsNotEmpty()
  businessType: PrismaBusinessType;

  @ApiProperty({
    example: '2020-01-01',
    description: 'Date of incorporation in ISO format',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfIncorporation: string;

  @ApiProperty({
    example: 'acme@example.com',
    description: 'The company email',
  })
  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @ApiProperty({ example: 'secret', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
