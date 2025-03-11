import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard';
import { KeepAliveService } from './common/keep-alive.service';
import { ItemModule } from './item/item.module';
import { MarketModule } from './market/market.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    HealthModule,
    UserModule,
    PrismaModule,
    ItemModule,
    MarketModule,
    PortfolioModule,
    SettingsModule,
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
