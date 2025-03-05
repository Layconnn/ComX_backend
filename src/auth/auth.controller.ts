/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  Res,
  Logger,
  Post,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { IndividualSignupDto } from './dto/individual-signup.dto';
import { CorporateSignupDto } from './dto/corporate-signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './public-decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResendPasswordResetCodeDto } from './dto/resend-password-reset-code.dto';
import { ResendEmailCodeDto } from './dto/resend-email-code.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { UpdateIndividualProfileDto } from './dto/update-individualProfile.dto';
import { UpdateCorporateProfileDto } from './dto/update-corporateProfile.dto';
import { JwtAuthGuard } from './guard';
import { RedisStateStoreService } from './store/redis-state-store.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private stateStore: RedisStateStoreService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req: Request) {
    console.log(
      `Google auth initiated with query params: ${JSON.stringify(req.query)}`,
    );
  }

  @Public()
  @Get('google-redirect')
  async googleRedirect(
    @Query('accountType')
    accountType: 'corporate' | 'individual' = 'individual',
    @Res() res: Response,
  ) {
    // Generate a random state token and store the intended accountType in Redis.
    const state = await this.stateStore.generateState(accountType);

    // Build the Google OAuth URL manually.
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_CALLBACK_URL');
    if (!redirectUri) {
      throw new Error('GOOGLE_CALLBACK_URL is not defined');
    }
    const scope = encodeURIComponent('email profile');
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&prompt=select_account`;

    return res.redirect(googleAuthUrl);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // By the time this endpoint is hit, Passport has exchanged the code for user profile,
    // and the GoogleStrategy.validate() has already looked up and removed the state from Redis.
    if (!req.user) {
      return res
        .status(400)
        .send('Authentication failed: No user data received');
    }
    const tokenData = await this.authService.googleLogin(req.user);
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const googleEmail = (req.user as any).email;

    return res.redirect(
      `${frontendUrl}/register/complete-profile?token=${tokenData.access_token}&email=${googleEmail}`,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Patch('profile/individual')
  @ApiOperation({ summary: 'Complete your profile (Individual)' })
  async updateIndividualProfile(
    @Body() updateIndividualProfileDto: UpdateIndividualProfileDto,
    @GetUser() user: { sub: string },
  ) {
    const userId = Number(user.sub);
    return this.authService.updateIndividualUserProfile(
      updateIndividualProfileDto,
      userId,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Patch('profile/corporate')
  @ApiOperation({ summary: 'Complete your profile (Corporate)' })
  @UseGuards(JwtAuthGuard)
  async updateCorporateProfile(
    @Body() updateCorporateProfileDto: UpdateCorporateProfileDto,
    @GetUser() user: { sub: string },
  ) {
    const userId = Number(user.sub);
    return this.authService.updateCorporateUserProfile(
      updateCorporateProfileDto,
      userId,
    );
  }

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
