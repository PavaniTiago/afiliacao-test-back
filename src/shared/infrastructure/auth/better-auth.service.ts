import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import { createAuthInstance } from './auth.config';
import { session, user } from './schema/auth.schema';
import { eq, and, gt } from 'drizzle-orm';

@Injectable()
export class BetterAuthService {
  public auth: ReturnType<typeof createAuthInstance>;

  constructor(private readonly drizzleService: DrizzleService) {
    this.auth = createAuthInstance(this.drizzleService);
  }

  private extractRawToken(token: string): string {
    return token.includes('.') ? token.split('.')[0] : token;
  }

  async invalidateSession(token: string): Promise<boolean> {
    try {
      const rawToken = this.extractRawToken(token);

      await this.drizzleService.db
        .delete(session)
        .where(eq(session.token, rawToken));

      return true;
    } catch {
      return false;
    }
  }

  async validateSession(token: string) {
    try {
      const rawToken = this.extractRawToken(token);

      const sessionData = await this.drizzleService.db
        .select({
          session: session,
          user: user,
        })
        .from(session)
        .innerJoin(user, eq(session.userId, user.id))
        .where(
          and(eq(session.token, rawToken), gt(session.expiresAt, new Date())),
        )
        .limit(1);

      if (!sessionData || sessionData.length === 0) {
        return null;
      }

      const { session: sessionRecord, user: userRecord } = sessionData[0];

      return {
        user: {
          id: userRecord.id,
          email: userRecord.email,
          name: userRecord.name,
          emailVerified: userRecord.emailVerified,
          createdAt: userRecord.createdAt,
          updatedAt: userRecord.updatedAt,
        },
        session: {
          id: sessionRecord.id,
          userId: sessionRecord.userId,
          expiresAt: sessionRecord.expiresAt,
          token: sessionRecord.token,
          ipAddress: sessionRecord.ipAddress,
          userAgent: sessionRecord.userAgent,
          createdAt: sessionRecord.createdAt,
          updatedAt: sessionRecord.updatedAt,
        },
      };
    } catch {
      return null;
    }
  }
}
