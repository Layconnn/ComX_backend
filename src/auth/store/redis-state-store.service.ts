import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as Redis from 'ioredis';
import { randomBytes } from 'crypto';

@Injectable()
export class RedisStateStoreService implements OnModuleInit, OnModuleDestroy {
  private client: Redis.Redis;

  onModuleInit() {
    this.client = new Redis.default({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async generateState(
    accountType: 'corporate' | 'individual',
  ): Promise<string> {
    const state = randomBytes(16).toString('hex');
    // Store the state with a TTL of 5 minutes (300 seconds)
    await this.client.setex(`oauth_state:${state}`, 300, accountType);
    return state;
  }

  async getAccountType(
    state: string,
  ): Promise<'corporate' | 'individual' | null> {
    const accountType = await this.client.get(`oauth_state:${state}`);
    return accountType as 'corporate' | 'individual' | null;
  }

  async removeState(state: string): Promise<void> {
    await this.client.del(`oauth_state:${state}`);
  }
}
