import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendEmailCodeDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address to which the signup OTP should be resent',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
