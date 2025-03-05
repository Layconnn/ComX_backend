/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';
import 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
  });

  // Configure session middleware
  app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 60 * 60 * 1000,
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Configure CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://comx-mfb.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ComX API')
    .setDescription('API documentation for the ComX MFB application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Use port 4000 to match the frontend configuration
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}/api`);
}
void bootstrap();
