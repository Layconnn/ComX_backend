/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.setTimeout(30000); // Increase timeout if needed

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';

describe('Login & Get User e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: number;

  // dummy email for testing purpose
  const individualEmail = 'comx+test@example.com';
  const password = 'mypassword';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    const port = 3388;
    await app.listen(port);

    prisma = app.get(PrismaService);
    // Clean DB for test isolation
    await prisma.cleanDb();

    pactum.request.setBaseUrl(`http://localhost:${port}`);

    // --- Create an Individual User ---
    await pactum
      .spec()
      .post('/auth/signup/individual')
      .withBody({
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '1234567899',
        email: individualEmail,
        password,
      })
      .expectStatus(201);

    // Verify OTP for normal flow, but here I manually marked the user as verified.
    await prisma.individualUser.update({
      where: { email: individualEmail },
      data: { verificationCode: null },
    });

    // Retrieve the created user's id
    const user = await prisma.individualUser.findUnique({
      where: { email: individualEmail },
    });
    if (!user) {
      throw new Error('User creation failed');
    }
    userId = user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login with correct credentials', async () => {
    const spec = pactum
      .spec()
      .post('/auth/login')
      .withBody({
        email: individualEmail,
        password,
      })
      .expectStatus(200);
    await spec.toss();
    // Extract token from the response
    accessToken = (await spec.returns('res.body')).access_token;
  });

  it('should return the current user profile', async () => {
    await pactum
      .spec()
      .get('/user/me')
      .withHeaders({
        Authorization: `Bearer ${accessToken}`,
      })
      .expectStatus(200)
      .expectJsonLike({
        id: userId,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '1234567899',
        email: individualEmail,
      });
  });
});
