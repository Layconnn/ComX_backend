import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Create testing module using the root AppModule
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create the Nest application instance
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Use process.env.PORT or default to 3333 for tests
    const port = 3555;
    await app.listen(port);

    // Get the Prisma service instance
    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    // Set the base URL for Pactum
    pactum.request.setBaseUrl(`http://localhost:${port}`);
  });

  afterAll(async () => {
    await app.close();
  });

  it.todo('should signin');
});
