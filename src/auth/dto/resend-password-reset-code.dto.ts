import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendPasswordResetCodeDto {
  @ApiProperty({
    example: 'john@example.com',
    description:
      'The email address to which the password reset OTP should be resent',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
