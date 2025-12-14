import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { DrizzleService } from '../database/drizzle.service';
import * as authSchema from './schema/auth.schema';

export const createAuthInstance = (drizzleService: DrizzleService) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isCrossOrigin = process.env.CROSS_ORIGIN === 'true';
  const needsCrossOriginCookies = isProduction || isCrossOrigin;

  return betterAuth({
    database: drizzleAdapter(drizzleService.db, {
      provider: 'pg',
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    secret:
      process.env.AUTH_SECRET ||
      'dev-secret-key-please-change-in-production-at-least-32-chars',
    trustedOrigins: [
      process.env.APP_URL || 'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:3333',
    ],
    advanced: {
      defaultCookieAttributes: {
        sameSite: needsCrossOriginCookies ? 'none' : 'lax',
        secure: needsCrossOriginCookies,
        httpOnly: true,
      },
    },
  });
};
