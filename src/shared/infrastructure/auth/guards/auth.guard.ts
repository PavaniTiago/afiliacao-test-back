import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { BetterAuthService } from '../better-auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: BetterAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const session = await this.authService.validateSession(token);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    request.user = session.user;
    request.session = session.session;

    return true;
  }

  private extractTokenFromCookie(request: any): string | null {
    const cookies = request.cookies || {};
    return cookies['better-auth.session_token'] || null;
  }
}
