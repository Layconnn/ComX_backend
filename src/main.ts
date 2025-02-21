import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
  });

  app.enableCors({
    origin: 'http://localhost:3000',
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Swagger configuration using DocumentBuilder
  const config = new DocumentBuilder()
    .setTitle('ComX API')
    .setDescription('API documentation for the ComX MFB application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;

  await app.listen(port, '0.0.0.0');
}
void bootstrap();
