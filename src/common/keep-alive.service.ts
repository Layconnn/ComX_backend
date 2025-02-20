/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as https from 'https';
import * as cron from 'node-cron';

@Injectable()
export class KeepAliveService implements OnModuleInit {
  private urlToPing = process.env.RENDER_URL || '';

  private keepAlive(url: string) {
    https
      .get(url, (res) => {
        console.log(`Keep-alive ping status: ${res.statusCode}`);
      })
      .on('error', (error) => {
        console.error(`Keep-alive ping error: ${error.message}`);
      });
  }

  onModuleInit() {
    if (!this.urlToPing) {
      console.error('RENDER_URL is not defined.');
      return;
    }

    // Schedule a ping every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.keepAlive(this.urlToPing);
      console.log('Pinging the server every 5 minutes');
    });

    console.log('KeepAliveService initialized.');
  }
}
