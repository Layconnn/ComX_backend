import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard';
import { KeepAliveService } from './common/keep-alive.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
  ],
  providers: [
    // Global Authentication Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    KeepAliveService,
  ],
})
export class AppModule {}
