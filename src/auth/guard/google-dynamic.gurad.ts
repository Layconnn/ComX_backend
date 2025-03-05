/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleDynamicAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleDynamicAuthGuard.name);

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // i logged this to debug
    this.logger.log(`Guard: query params => ${JSON.stringify(request.query)}`);

    // If this is the callback route, let Passport handle state verification.
    if (request.url.includes('/callback')) {
      return super.getAuthenticateOptions(context);
    }

    // in the initial req, setting accountType from query as a state
    const accountType = request.query.accountType || 'individual';
    this.logger.log(`Guard: using state => ${accountType}`);

    return {
      ...super.getAuthenticateOptions(context),
      state: accountType,
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`, error.stack);
      const request = context.switchToHttp().getRequest();
      if (request.url.includes('/callback')) {
        request.authError = error;
        return true;
      }
      throw error;
    }
  }
}
