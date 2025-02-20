/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { IndividualSignupDto } from './dto/individual-signup.dto';
import { CorporateSignupDto } from './dto/corporate-signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as nodemailer from 'nodemailer';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Twilio } from 'twilio';
import { LoginDto } from './dto/login.dto';
import { ResendPasswordResetCodeDto } from './dto/resend-password-reset-code.dto';
import { ResendEmailCodeDto } from './dto/resend-email-code.dto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  private twilioClient: Twilio;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('EMAIL_USER'),
        pass: this.config.get<string>('EMAIL_PASS'),
      },
    });
    // Initialize Twilio client for SMS (for individual sign-up)
    this.twilioClient = new Twilio(
      this.config.get<string>('TWILIO_ACCOUNT_SID'),
      this.config.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  // Helper to generate a 4-digit OTP as a string
  private generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Helper to send an email with the OTP
  private async sendEmailVerificationCode(
    email: string,
    code: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      console.log(`[TEST] Would send email to ${email} with code: ${code}`);
      return;
    }
    await this.transporter.sendMail({
      from: this.config.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is ${code}`,
      html: `<p>Your verification code is <strong>${code}</strong></p>`,
    });
  }

  // Helper to send an SMS with the OTP (used for individual sign-up)
  private async sendSmsVerificationCode(
    phone: string,
    code: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      console.log(`[TEST] Would send SMS to ${phone} with code: ${code}`);
      return;
    }
    const from = this.config.get<string>('TWILIO_PHONE_NUMBER');
    const message = `Your verification code is ${code}`;
    try {
      await this.twilioClient.messages.create({
        body: message,
        from,
        to: phone,
      });
      console.log(`SMS sent to ${phone}`);
    } catch (error) {
      console.error(`Failed to send SMS to ${phone}`, error);
    }
  }

  // ----- Sign-Up Flow (Individual) -----
  async signupIndividual(dto: IndividualSignupDto) {
    // Check if phone or email already exists
    const existingUser = await this.prisma.individualUser.findFirst({
      where: { OR: [{ phone: dto.phone }, { email: dto.email }] },
    });
    if (existingUser) {
      throw new ForbiddenException('Phone number or email already in use.');
    }

    const hash = await argon.hash(dto.password);
    // Generate OTP for sign-up and store in verificationCode field
    const verificationCode = this.generateVerificationCode();

    try {
      const user = await this.prisma.individualUser.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          hash,
          verificationCode,
        },
      });
      // Send OTP via email and SMS
      await this.sendEmailVerificationCode(dto.email, verificationCode);
      if (user.phone) {
        await this.sendSmsVerificationCode(user.phone, verificationCode);
      }
      return {
        message:
          'Individual account created. A verification code has been sent to your email.',
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  // ----- Sign-Up Flow (Corporate) -----
  async signupCorporate(dto: CorporateSignupDto) {
    // Check if the company email already exists
    const existingUser = await this.prisma.corporateUser.findUnique({
      where: { email: dto.companyEmail },
    });
    if (existingUser) {
      throw new ForbiddenException('Company email already in use.');
    }

    const hash = await argon.hash(dto.password);
    // Generate OTP for sign-up and store in verificationCode field
    const verificationCode = this.generateVerificationCode();

    try {
      const user = await this.prisma.corporateUser.create({
        data: {
          companyName: dto.companyName,
          businessType: dto.businessType,
          dateOfIncorporation: new Date(dto.dateOfIncorporation),
          email: dto.companyEmail,
          hash,
          verificationCode,
        },
      });
      // Send OTP via email (corporate uses email only)
      await this.sendEmailVerificationCode(dto.companyEmail, verificationCode);
      return {
        message:
          'Corporate account created. A verification code has been sent to your email.',
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  // ----- Sign-Up OTP Verification -----
  // Verifies the OTP sent during sign-up by comparing with verificationCode.
  async verifySignupOtp(dto: VerifyOtpDto) {
    // Look up the user by email (from either table)
    const individualUser = await this.prisma.individualUser.findUnique({
      where: { email: dto.email },
    });
    const corporateUser = await this.prisma.corporateUser.findUnique({
      where: { email: dto.email },
    });
    const user = individualUser || corporateUser;
    if (!user) {
      throw new ForbiddenException('User not found.');
    }
    if (user.verificationCode !== dto.otp) {
      throw new ForbiddenException('Incorrect OTP code.');
    }
    // Clear the OTP after successful verification
    if (individualUser) {
      await this.prisma.individualUser.update({
        where: { id: individualUser.id },
        data: { verificationCode: null },
      });
    } else if (corporateUser) {
      await this.prisma.corporateUser.update({
        where: { id: corporateUser.id },
        data: { verificationCode: null },
      });
    }
    return this.signToken(user);
  }

  // In AuthService (backend)
  async verifyResetOtp(dto: VerifyOtpDto) {
    // Look up user by email (using resetPasswordToken)
    const user =
      (await this.prisma.individualUser.findUnique({
        where: { email: dto.email },
      })) ||
      (await this.prisma.corporateUser.findUnique({
        where: { email: dto.email },
      }));
    if (!user) {
      throw new ForbiddenException('User not found.');
    }
    if (user.resetPasswordToken !== dto.otp) {
      throw new ForbiddenException('Incorrect OTP code.');
    }
    // Optionally, return some temporary verification result (or token) here.
    return this.signToken(user);
  }

  // ----- Login -----
  async login(dto: LoginDto) {
    const individualUser = await this.prisma.individualUser.findUnique({
      where: { email: dto.email },
    });
    const corporateUser = await this.prisma.corporateUser.findUnique({
      where: { email: dto.email },
    });
    const user = individualUser || corporateUser;
    if (!user) throw new ForbiddenException('User does not exist');
    const pMatches = await argon.verify(user.hash, dto.password);
    if (!pMatches) throw new ForbiddenException('Credentials incorrect');
    return this.signToken(user);
  }

  // ----- Password Reset Flow -----
  // Request Password Reset: generate OTP and store it in resetPasswordToken.
  async requestPasswordReset(dto: RequestResetPasswordDto) {
    const user =
      (await this.prisma.individualUser.findUnique({
        where: { email: dto.email },
      })) ||
      (await this.prisma.corporateUser.findUnique({
        where: { email: dto.email },
      }));
    if (!user) throw new NotFoundException('User not found');
    const resetCode = this.generateVerificationCode();
    if ('companyName' in user) {
      await this.prisma.corporateUser.update({
        where: { email: dto.email },
        data: { resetPasswordToken: resetCode },
      });
    } else {
      await this.prisma.individualUser.update({
        where: { email: dto.email },
        data: { resetPasswordToken: resetCode },
      });
    }
    console.log('Stored OTP for', dto.email, 'is', resetCode);
    await this.sendEmailVerificationCode(dto.email, resetCode);
    return { message: 'Password reset verification code sent.' };
  }

  // Reset Password: verify OTP (stored in resetPasswordToken) and update password.
  async resetPassword(dto: ResetPasswordDto) {
    const user =
      (await this.prisma.individualUser.findFirst({
        where: { email: dto.email, resetPasswordToken: dto.token },
      })) ||
      (await this.prisma.corporateUser.findFirst({
        where: { email: dto.email, resetPasswordToken: dto.token },
      }));
    if (!user) {
      throw new ForbiddenException('Invalid or expired token');
    }
    if (user.resetPasswordToken !== dto.token) {
      throw new ForbiddenException('Invalid token');
    }
    const hash = await argon.hash(dto.newPassword);
    if ('companyName' in user) {
      await this.prisma.corporateUser.update({
        where: { id: user.id },
        data: { hash, resetPasswordToken: null },
      });
    } else {
      await this.prisma.individualUser.update({
        where: { id: user.id },
        data: { hash, resetPasswordToken: null },
      });
    }
    const tokenData = await this.signToken(user);
    return {
      message: 'Password reset successfully',
      access_token: tokenData.access_token,
    };
  }

  // ----- Resend OTP Functions -----
  // For Sign-Up: update the verificationCode field and resend the OTP.
  async resendSignupVerificationCode(dto: ResendEmailCodeDto) {
    const user =
      (await this.prisma.individualUser.findUnique({
        where: { email: dto.email },
      })) ||
      (await this.prisma.corporateUser.findUnique({
        where: { email: dto.email },
      }));
    if (!user) throw new NotFoundException('User not found');
    const newCode = this.generateVerificationCode();
    if ('companyName' in user) {
      await this.prisma.corporateUser.update({
        where: { email: dto.email },
        data: { verificationCode: newCode },
      });
    } else {
      await this.prisma.individualUser.update({
        where: { email: dto.email },
        data: { verificationCode: newCode },
      });
    }
    await this.sendEmailVerificationCode(dto.email, newCode);
    return { message: 'New verification code sent to email.' };
  }

  // For Password Reset: update the resetPasswordToken field and resend the OTP.
  async resendPasswordResetCode(dto: ResendPasswordResetCodeDto) {
    const user =
      (await this.prisma.individualUser.findUnique({
        where: { email: dto.email },
      })) ||
      (await this.prisma.corporateUser.findUnique({
        where: { email: dto.email },
      }));
    if (!user) throw new NotFoundException('User not found');
    const newCode = this.generateVerificationCode();
    if ('companyName' in user) {
      await this.prisma.corporateUser.update({
        where: { email: dto.email },
        data: { resetPasswordToken: newCode },
      });
    } else {
      await this.prisma.individualUser.update({
        where: { email: dto.email },
        data: { resetPasswordToken: newCode },
      });
    }
    await this.sendEmailVerificationCode(dto.email, newCode);
    return { message: 'New password reset code sent to email.' };
  }

  // Generate JWT token
  async signToken(user: any): Promise<{ access_token: string }> {
    const userType = user.companyName ? 'corporate' : 'individual';
    const payload = { sub: user.id, email: user.email, userType };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.get<string>('JWT_SECRET'),
    });
    return { access_token: token };
  }
}
