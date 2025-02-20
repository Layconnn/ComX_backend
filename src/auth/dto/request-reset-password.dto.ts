import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetPasswordDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address to request password reset',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
