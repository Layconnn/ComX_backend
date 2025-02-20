/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.setTimeout(30000); // Increase timeout to 30 seconds

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module'; // Your root module
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // --- Helper Functions to Retrieve OTP Values from DB ---
  async function getSignupOtp(email: string): Promise<string> {
    const individualUser = await prisma.individualUser.findUnique({
      where: { email },
    });
    if (individualUser && individualUser.verificationCode)
      return individualUser.verificationCode;
    const corporateUser = await prisma.corporateUser.findUnique({
      where: { email },
    });
    if (corporateUser && corporateUser.verificationCode)
      return corporateUser.verificationCode;
    throw new Error(`Signup OTP not found for ${email}`);
  }

  async function getResetOtp(email: string): Promise<string> {
    const individualUser = await prisma.individualUser.findUnique({
      where: { email },
    });
    if (individualUser && individualUser.resetPasswordToken)
      return individualUser.resetPasswordToken;
    const corporateUser = await prisma.corporateUser.findUnique({
      where: { email },
    });
    if (corporateUser && corporateUser.resetPasswordToken)
      return corporateUser.resetPasswordToken;
    throw new Error(`Reset OTP not found for ${email}`);
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    const PORT = 3333;
    pactum.request.setBaseUrl(`http://localhost:${PORT}`);
  });

  afterAll(async () => {
    await app.close();
  });

  // --- Individual Sign-Up Flow ---
  describe('Sign Up (Individual)', () => {
    const individualEmail = 'comx@yopmail.com';
    it('should sign up an individual user', async () => {
      await pactum
        .spec()
        .post('/auth/signup/individual')
        .withBody({
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          email: individualEmail,
          password: 'mypassword',
        })
        .expectStatus(201);
    });

    it('should fail if email is already in use', () => {
      return pactum
        .spec()
        .post('/auth/signup/individual')
        .withBody({
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          email: individualEmail, // same email
          password: 'mypassword',
        })
        .expectStatus(403);
    });

    it('should verify the OTP for individual user using real OTP from DB', async () => {
      const otp = await getSignupOtp(individualEmail);
      console.log(`Real signup OTP for ${individualEmail}: ${otp}`);
      await pactum
        .spec()
        .post('/auth/verify-otp')
        .withBody({
          email: individualEmail,
          otp,
        })
        .expectStatus(200)
        .stores('accessToken', 'access_token');
    });
  });

  // --- Corporate Sign-Up Flow ---
  describe('Sign Up (Corporate)', () => {
    const corporateEmail = 'jinadukhalil@gmail.com';
    it('should sign up a corporate user', async () => {
      await pactum
        .spec()
        .post('/auth/signup/corporate')
        .withBody({
          companyName: 'Acme Inc',
          businessType: 'SERVICE',
          dateOfIncorporation: '2020-01-01',
          companyEmail: corporateEmail,
          password: 'secret',
        })
        .expectStatus(201);
    });

    it('should verify the OTP for corporate user using real OTP from DB', async () => {
      const otp = await getSignupOtp(corporateEmail);
      console.log(`Real corporate signup OTP for ${corporateEmail}: ${otp}`);
      await pactum
        .spec()
        .post('/auth/verify-otp')
        .withBody({
          email: corporateEmail,
          otp,
        })
        .expectStatus(200)
        .stores('accessToken', 'access_token');
    });
  });

  // --- Resend OTP Endpoints ---
  describe('Resend OTP Endpoints', () => {
    it('should resend signup OTP code', async () => {
      await pactum
        .spec()
        .post('/auth/resend-verify-otp')
        .withBody({ email: 'comx@yopmail.com' })
        .expectStatus(201)
        .expectBodyContains('New verification code sent to email.');
    });

    it('should resend password reset OTP code', async () => {
      await pactum
        .spec()
        .post('/auth/resend-password-reset-otp')
        .withBody({ email: 'comx@yopmail.com' })
        .expectStatus(201)
        .expectBodyContains('New password reset code sent to email.');
    });
  });

  // --- Login ---
  describe('Login', () => {
    it('should login with correct credentials (Individual)', () => {
      return pactum
        .spec()
        .post('/auth/login')
        .withBody({
          email: 'comx@yopmail.com',
          password: 'mypassword',
        })
        .expectStatus(200)
        .stores('accessToken', 'access_token');
    });

    it('should fail login with wrong password', () => {
      return pactum
        .spec()
        .post('/auth/login')
        .withBody({
          email: 'comx@yopmail.com',
          password: 'wrongpassword',
        })
        .expectStatus(403);
    });
  });

  // --- Password Reset Flow ---
  describe('Password Reset Flow', () => {
    it('should request a password reset', async () => {
      await pactum
        .spec()
        .post('/auth/request-password-reset')
        .withBody({ email: 'comx@yopmail.com' })
        .expectStatus(201);
    });

    it('should verify reset OTP using real OTP from DB', async () => {
      const resetOtp = await getResetOtp('comx@yopmail.com');
      console.log(`Real reset OTP for comx@yopmail.com: ${resetOtp}`);
      await pactum
        .spec()
        .post('/auth/verify-reset-password-otp')
        .withBody({
          email: 'comx@yopmail.com',
          otp: resetOtp,
        })
        .expectStatus(200);
    });

    it('should reset password with correct token', async () => {
      let token: string;
      try {
        token = await getResetOtp('comx@yopmail.com');
      } catch (err) {
        token = '5678'; // fallback if OTP is cleared
      }
      await pactum
        .spec()
        .put('/auth/reset-password')
        .withBody({
          email: 'comx@yopmail.com',
          token,
          newPassword: 'newPassword123',
        })
        .expectStatus(200)
        .stores('accessToken', 'access_token');
    });
  });
});
