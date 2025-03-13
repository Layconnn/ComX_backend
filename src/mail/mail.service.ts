/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendOtpEmail(options: {
    email: string;
    subject: string;
    heading: string;
    message: string;
    code: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: options.email,
        subject: options.subject,
        template: 'otp-email', // This will load otp-email.hbs from the template dir
        context: {
          heading: options.heading,
          message: options.message,
          code: options.code,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`OTP email sent to ${options.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send OTP email to ${options.email}`,
        error.stack,
      );
      throw error;
    }
  }
}
