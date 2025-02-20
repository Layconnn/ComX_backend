/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Extract token from the Authorization header as a Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use a secret from your environment or fallback to a default
      secretOrKey: config.get('JWT_SECRET') || 'mancho',
    });
  }

  // If validation passes, this method returns a value that gets attached to the request object (as req.user)
  async validate(payload: {
    sub: number;
    email: string;
    userType: 'individual' | 'corporate';
  }) {
    let user;

    if (payload.userType === 'individual') {
      user = await this.prisma.individualUser.findUnique({
        where: {
          id: payload.sub,
        },
      });
    } else if (payload.userType === 'corporate') {
      user = await this.prisma.corporateUser.findUnique({
        where: {
          id: payload.sub,
        },
      });
    }

    if (user) {
      const { hash, verificationCode, ...rest } = user;
      return { sub: user.id, ...rest }; // Return user without sensitive data like hash and verificationCode
    }

    return null; // If user is not found, return null
  }
}
