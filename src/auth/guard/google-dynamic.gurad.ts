/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log(
      'Inside handleRequest => err:',
      err,
      'user:',
      user,
      'info:',
      info,
    );
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    if (err || !user) {
      if (err?.message === 'Email already exists') {
        const userType =
          req.query.accountType === 'corporate' ? 'corporate' : 'individual';

        // Build the correct redirect URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl =
          userType === 'corporate'
            ? `${frontendUrl}/register/corporate/company-information`
            : `${frontendUrl}/register/individual/basic-information`;

        // Redirect with the error message in the query string
        res.redirect(
          `${redirectUrl}?error=An%20account%20with%20that%20email%20already%20exists`,
        );
        return null;
      }

      // If it's some other error, handle or re-throw
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
