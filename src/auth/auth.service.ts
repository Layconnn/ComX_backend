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
import { LoginDto } from './dto/login.dto';
import { ResendPasswordResetCodeDto } from './dto/resend-password-reset-code.dto';
import { ResendEmailCodeDto } from './dto/resend-email-code.dto';
import { UpdateIndividualProfileDto } from './dto/update-individualProfile.dto';
import { UpdateCorporateProfileDto } from './dto/update-corporateProfile.dto';
import { BusinessType } from '@prisma/client';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

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
  }

  // Helper to generate a 4-digit OTP
  private generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private async sendEmailVerificationCode(
    email: string,
    code: string,
  ): Promise<void> {
    const htmlTemplate = `
      <html>
        <head>
          <style>
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              font-family: Arial, sans-serif;
              background-color: #f7f7f7;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 10px;
              text-align: center;
            }
            .content {
              margin: 20px 0;
              font-size: 16px;
              color: #333;
            }
            .code {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              color: #4CAF50;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>ComX Verification Code</h2>
            </div>
            <div class="content">
              <p>Thank you for signing up with ComX. Please use the verification code below to complete your sign up process.</p>
            </div>
            <div class="code">${code}</div>
            <div class="content">
              <p>If you did not initiate this request, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ComX. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    await this.transporter.sendMail({
      from: this.config.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Your ComX Verification Code',
      html: htmlTemplate,
    });
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
      // Send OTP via email
      await this.sendEmailVerificationCode(dto.email, verificationCode);
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

  async validateGoogleUser(userData: {
    googleId: string;
    displayName: string;
    email: string | null;
    picture: string | null;
    accessToken: string;
    accountType?: 'individual' | 'corporate';
  }): Promise<any> {
    console.log(
      `Validating Google user: ${userData.email}, Account type: ${userData.accountType}`,
    );

    if (!userData.email) {
      console.error('Google profile does not contain an email address');
      throw new Error('Google profile does not contain an email address.');
    }

    // Check if a user exists in either table.
    const existingIndividual = await this.prisma.individualUser.findUnique({
      where: { email: userData.email },
    });
    const existingCorporate = await this.prisma.corporateUser.findUnique({
      where: { email: userData.email },
    });

    if (existingIndividual || existingCorporate) {
      const user = existingIndividual || existingCorporate;
      console.log(`Found existing user: ${userData.email}`);

      // Determine if the user is "incomplete" based on dummy values:
      if (user && 'companyName' in user) {
        // Corporate user: if companyName === 'company_dummy', then it's incomplete.
        if (user.companyName === 'company_dummy') {
          return user;
        } else {
          console.warn(
            `Email already exists as a complete corporate account: ${userData.email}`,
          );
          throw new ForbiddenException('Email already exists');
        }
      } else {
        // Individual user: if firstName === 'GoogleUser', then it's incomplete.
        if (user && user.firstName === 'GoogleUser') {
          return user;
        } else {
          console.warn(
            `Email already exists as a complete individual account: ${userData.email}`,
          );
          throw new ForbiddenException('Email already exists');
        }
      }
    }

    // Use the provided accountType, defaulting to 'individual'.
    const accountType = userData.accountType || 'individual';
    console.log(`Creating new ${accountType} user for: ${userData.email}`);

    if (accountType === 'corporate') {
      // Create a new corporate user with dummy defaults.
      const dummyHash = 'google_auth_dummy';
      const companyName = 'company_dummy'; // to be updated later
      const defaultBusinessType = 'RETAIL';
      const dateOfIncorporation = new Date();

      const newCorporateUser = await this.prisma.corporateUser.create({
        data: {
          googleId: userData.googleId,
          displayName: userData.displayName,
          email: userData.email,
          picture: userData.picture,
          companyName,
          businessType: defaultBusinessType,
          dateOfIncorporation,
          hash: dummyHash,
        },
      });
      console.log('Created corporate user:', newCorporateUser);
      return newCorporateUser;
    } else {
      // Create a new individual user.
      const firstName = 'GoogleUser';
      const lastName = 'monday';
      const dummyPhone = `google-${userData.googleId}`;
      const dummyHash = 'google_auth_dummy';

      const newIndividualUser = await this.prisma.individualUser.create({
        data: {
          googleId: userData.googleId,
          displayName: userData.displayName,
          email: userData.email,
          picture: userData.picture,
          firstName: firstName,
          lastName,
          phone: dummyPhone,
          hash: dummyHash,
        },
      });
      console.log('Created individual user:', newIndividualUser);
      return newIndividualUser;
    }
  }

  async googleLogin(
    user: any,
  ): Promise<{ access_token: string; isNewUser: boolean; user: any }> {
    if (!user) {
      console.error('No user provided for Google login');
      throw new ForbiddenException('No user provided');
    }

    const isNewUser = user.companyName
      ? user.companyName === 'company_dummy'
      : user.firstName === 'GoogleUser';

    console.log(
      `Generating token for user: ${user.email}, isNewUser: ${isNewUser}`,
    );

    const tokenData = await this.signToken(user, isNewUser);
    return {
      ...tokenData,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        picture: user.picture,
        accountType: user.companyName ? 'corporate' : 'individual',
      },
    };
  }

  // Update individual user profile, then generate and send a verification code
  async updateIndividualUserProfile(
    dto: UpdateIndividualProfileDto,
    userId: number,
  ): Promise<{ message: string }> {
    // Ensure the password field is provided
    console.log('Received password:', dto.password);
    if (!dto.password) {
      throw new ForbiddenException('Password is required.');
    }
    const hashedPassword = await argon.hash(dto.password);

    // Update the individual user's profile
    const updatedUser = await this.prisma.individualUser.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        hash: hashedPassword,
      },
    });

    // Generate a 4-digit verification code
    const verificationCode = this.generateVerificationCode();

    // Update the user's record with the verification code
    await this.prisma.individualUser.update({
      where: { id: userId },
      data: { verificationCode },
    });

    // Send the styled HTML verification email
    await this.sendEmailVerificationCode(updatedUser.email, verificationCode);

    return {
      message:
        'Profile updated successfully. A verification code has been sent to your email.',
    };
  }

  // Update corporate user profile, then generate and send a verification code
  async updateCorporateUserProfile(
    dto: UpdateCorporateProfileDto,
    userId: number,
  ): Promise<{ message: string }> {
    // Ensure the password field is provided
    console.log('Received password:', dto.password);
    if (!dto.password) {
      throw new ForbiddenException('Password is required.');
    }
    const hashedPassword = await argon.hash(dto.password);

    // Update the corporate user's profile. Convert the date string to a Date object.
    const updatedUser = await this.prisma.corporateUser.update({
      where: { id: userId },
      data: {
        companyName: dto.companyName,
        businessType: dto.businessType as BusinessType,
        dateOfIncorporation: new Date(dto.dateOfIncorporation),
        hash: hashedPassword,
      },
    });

    // Generate a 4-digit verification code
    const verificationCode = this.generateVerificationCode();

    // Update the corporate user's record with the verification code
    await this.prisma.corporateUser.update({
      where: { id: userId },
      data: { verificationCode },
    });

    // Send the styled HTML verification email
    await this.sendEmailVerificationCode(updatedUser.email, verificationCode);

    return {
      message:
        'Profile updated successfully. A verification code has been sent to your email.',
    };
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

  // ---- Verify Reset Password OTP ----
  async verifyResetOtp(dto: VerifyOtpDto) {
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

  // --- Reset Password ---
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

  // ---- Resend Password Reset Code ----
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
  async signToken(
    user: any,
    isNewUser: boolean = false,
  ): Promise<{ access_token: string; isNewUser: boolean }> {
    const userType = user.companyName ? 'corporate' : 'individual';
    const payload = { sub: user.id, email: user.email, userType, isNewUser };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.get<string>('JWT_SECRET'),
    });
    return { access_token: token, isNewUser };
  }
}
