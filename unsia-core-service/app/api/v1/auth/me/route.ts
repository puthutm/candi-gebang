import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userAccounts, roles, userRoles, sessions } from '@/db/schema';
import { verifyAccessToken } from '@/lib/jwt';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Authorization token is missing or invalid',
        [],
        401,
        correlationId
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token) as any;
    if (!decoded) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Token has expired or is invalid',
        [],
        401,
        correlationId
      );
    }

    // 1. Verify active session exists in DB
    const activeSession = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!activeSession || activeSession.expiresAt < new Date()) {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Session has expired or is inactive',
        [],
        401,
        correlationId
      );
    }

    // 2. Fetch user profile
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

    // 3. Fetch all assigned roles
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

    return createSuccessResponse(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: `${user.person.firstName} ${user.person.lastName}`,
          person: user.person,
        },
        activeRole: activeSession.activeRole,
        activeScope: {
          type: activeSession.activeScopeType,
          value: activeSession.activeScopeValue,
        },
        roles: assignedRoles.map((r) => ({
          code: r.roleCode,
          name: r.roleName,
          scopeType: r.scopeType,
          scopeValue: r.scopeValue,
        })),
      },
      'User profile retrieved successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Me profile error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
