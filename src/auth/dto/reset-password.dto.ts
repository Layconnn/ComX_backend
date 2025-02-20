import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '1234',
    description: 'OTP or token received for password reset',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newPassword123', description: 'The new password' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
