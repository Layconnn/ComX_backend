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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET') || 'mancho',
    });
  }

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
      return { sub: user.id, ...rest };
    }

    return null;
  }
}
