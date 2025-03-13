import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // This endpoint is for testing the OTP email.
  @Get('test-otp')
  async testOtp(@Query('email') email: string) {
    if (!email) {
      return { message: 'Please provide an email as a query parameter.' };
    }
    await this.mailService.sendOtpEmail({
      email,
      subject: 'Test OTP Email',
      heading: 'Your Test OTP',
      message: 'Use the code below to verify your email:',
      code: '123456',
    });
    return { message: 'Test OTP email sent.' };
  }
}
