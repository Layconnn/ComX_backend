import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IndividualSignupDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'mypassword', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
