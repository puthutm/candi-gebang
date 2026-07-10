import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { refreshTokens, userAccounts, persons, userRoles, roles, sessions } from '@/db/schema';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'refreshToken is required',
        [{ path: 'body', message: 'refreshToken missing' }],
        400,
        correlationId
      );
    }

    // 1. Verify refresh token signature
    const decoded = verifyRefreshToken(refreshToken) as any;
    if (!decoded) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Refresh token has expired or is invalid',
        [],
        401,
        correlationId
      );
    }

    // 2. Check if token exists in DB
    const dbToken = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, refreshToken),
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Refresh token has expired or is inactive',
        [],
        401,
        correlationId
      );
    }

    // 3. Get user details
    const user = await db.query.userAccounts.findFirst({
      where: eq(userAccounts.id, decoded.userId),
      with: {
        person: true,
      },
    });

    if (!user || !user.isActive) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'User is inactive or not found',
        [],
        401,
        correlationId
      );
    }

    // 4. Get active role
    const assignedRoles = await db
      .select({
        roleCode: roles.code,
        roleName: roles.name,
        scopeType: userRoles.scopeType,
        scopeValue: userRoles.scopeValue,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    if (assignedRoles.length === 0) {
      return createErrorResponse(
        'FORBIDDEN',
        'User has no assigned roles',
        [],
        403,
        correlationId
      );
    }

    const defaultRole = assignedRoles[0];

    // 5. Generate new tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      personId: user.personId,
      fullName: `${user.person.firstName} ${user.person.lastName}`,
      role: defaultRole.roleCode,
      scopeType: defaultRole.scopeType,
      scopeValue: defaultRole.scopeValue,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken({ userId: user.id });

    // 6. Delete old refresh token, save new one
    await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: refreshExpiresAt,
    });

    // 7. Save new session
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setHours(sessionExpiresAt.getHours() + 1);

    await db.insert(sessions).values({
      userId: user.id,
      token: newAccessToken,
      activeRole: defaultRole.roleCode,
      activeScopeType: defaultRole.scopeType,
      activeScopeValue: defaultRole.scopeValue,
      expiresAt: sessionExpiresAt,
    });

    return createSuccessResponse(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        activeRole: defaultRole.roleCode,
        activeScope: {
          type: defaultRole.scopeType,
          value: defaultRole.scopeValue,
        },
      },
      'Tokens refreshed successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
