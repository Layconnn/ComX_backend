import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IndividualSignupDto } from './dto/individual-signup.dto';
import { CorporateSignupDto } from './dto/corporate-signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './public-decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResendPasswordResetCodeDto } from './dto/resend-password-reset-code.dto';
import { ResendEmailCodeDto } from './dto/resend-email-code.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('signup/individual')
  @ApiOperation({ summary: 'Sign up an individual user' })
  signupIndividual(@Body() dto: IndividualSignupDto) {
    return this.authService.signupIndividual(dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('signup/corporate')
  @ApiOperation({ summary: 'Sign up a corporate user' })
  signupCorporate(@Body() dto: CorporateSignupDto) {
    return this.authService.signupCorporate(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  signin(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for sign up' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifySignupOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('verify-reset-password-otp')
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  verifyResetOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset' })
  requestPasswordReset(@Body() dto: RequestResetPasswordDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Put('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('resend-verify-otp')
  @ApiOperation({ summary: 'Resend signup OTP to email' })
  resendEmailCode(@Body() dto: ResendEmailCodeDto) {
    return this.authService.resendSignupVerificationCode(dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('resend-password-reset-otp')
  @ApiOperation({ summary: 'Resend password reset OTP to email' })
  resendPasswordResetCode(@Body() dto: ResendPasswordResetCodeDto) {
    return this.authService.resendPasswordResetCode(dto);
  }
}
