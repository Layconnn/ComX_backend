/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { RedisStateStoreService } from '../store/redis-state-store.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private redisStateStore: RedisStateStoreService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:4000/api/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });

    this.logger.log(
      `Google Strategy initialized with callback URL: ${
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:4000/api/auth/google/callback'
      }`,
    );
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    this.logger.log('GoogleStrategy validate() called');
    this.logger.log(`Request query: ${JSON.stringify(req.query)}`);

    // Retrieve the state token from the query.
    const stateToken = req.query.state as string;
    if (!stateToken) {
      return done(new ForbiddenException('Missing state parameter'), false);
    }

    // Use Redis to get the account type associated with the state token.
    const accountType = await this.redisStateStore.getAccountType(stateToken);
    if (!accountType) {
      return done(
        new ForbiddenException('Invalid or expired state parameter'),
        false,
      );
    }
    // Remove the state from Redis after usage.
    await this.redisStateStore.removeState(stateToken);

    this.logger.log(`Received accountType (from Redis state): ${accountType}`);

    const { id, displayName, emails, photos } = profile;
    const email =
      Array.isArray(emails) && emails.length > 0 ? emails[0].value : null;
    const photo =
      Array.isArray(photos) && photos.length > 0 ? photos[0].value : null;

    try {
      // Now pass the retrieved accountType to your AuthService.
      const user = await this.authService.validateGoogleUser({
        googleId: id,
        displayName,
        email,
        picture: photo,
        accessToken,
        accountType, // Will be either 'corporate' or 'individual'
      });

      done(null, user);
    } catch (err) {
      this.logger.error(
        `Google authentication error: ${err.message}`,
        err.stack,
      );
      done(err, false);
    }
  }
}
