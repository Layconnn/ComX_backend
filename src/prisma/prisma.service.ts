import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  /**
   * Clean the database by truncating tables.
   * Adjust table names as needed.
   */
  async cleanDb() {
    // TRUNCATE tables with CASCADE to remove all data and handle FK constraints.
    await this.$executeRawUnsafe(`
      TRUNCATE TABLE "individual_users", "corporate_users" CASCADE;
    `);
  }
}
