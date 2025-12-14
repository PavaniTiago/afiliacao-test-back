import { All, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { BetterAuthService } from '../better-auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: BetterAuthService) {}

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const token =
      (req.cookies?.['__Secure-better-auth.session_token'] as string) ||
      (req.cookies?.['better-auth.session_token'] as string) ||
      undefined;

    if (token) {
      await this.authService.invalidateSession(token);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const isCrossOrigin = process.env.CROSS_ORIGIN === 'true';
    const needsCrossOriginCookies = isProduction || isCrossOrigin;

    res.clearCookie('better-auth.session_token', {
      httpOnly: true,
      secure: needsCrossOriginCookies,
      sameSite: needsCrossOriginCookies ? 'none' : 'lax',
      path: '/',
    });

    res.clearCookie('__Secure-better-auth.session_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return res.json({ success: true, message: 'Logged out successfully' });
  }

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const baseURL =
        process.env.APP_URL ||
        process.env.BASE_URL ||
        `${req.protocol}://${req.get('host')}`;

      const url = `${baseURL}${req.originalUrl}`;

      const headers = new Headers();
      Object.keys(req.headers).forEach((key) => {
        const value = req.headers[key];
        if (value && typeof value === 'string') {
          headers.set(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        }
      });

      const webRequest = new Request(url, {
        method: req.method,
        headers: headers,
        body:
          req.method !== 'GET' && req.method !== 'HEAD' && req.body
            ? JSON.stringify(req.body)
            : undefined,
      });

      const response = await this.authService.auth.handler(webRequest);

      if (response instanceof Response) {
        const data = await response.text();
        res.status(response.status);

        const setCookieHeaders = response.headers.getSetCookie?.() || [];
        if (setCookieHeaders.length > 0) {
          setCookieHeaders.forEach((cookie) => {
            res.appendHeader('Set-Cookie', cookie);
          });
        }

        response.headers.forEach((value, key) => {
          if (key.toLowerCase() !== 'set-cookie') {
            res.setHeader(key, value);
          }
        });

        return res.send(data);
      }

      if (response && typeof response === 'object') {
        return res.json(response);
      }

      return res.status(404).json({ message: 'Not found' });
    } catch {
      console.error('Auth handler error: Internal server error');
      return res.status(500).json({
        message: 'Internal server error',
        error:
          process.env.NODE_ENV === 'development'
            ? 'Internal server error'
            : undefined,
      });
    }
  }
}
