import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { sessions, userRoles, roles, userAccounts, persons } from '@/db/schema';
import { verifyAccessToken, signAccessToken } from '@/lib/jwt';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
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

    const { roleCode } = await req.json();
    if (!roleCode) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'roleCode is required',
        [{ path: 'body', message: 'roleCode missing' }],
        400,
        correlationId
      );
    }

    // 1. Check if user is assigned to this role
    const userRoleAssignment = await db
      .select({
        roleId: roles.id,
        roleCode: roles.code,
        roleName: roles.name,
        scopeType: userRoles.scopeType,
        scopeValue: userRoles.scopeValue,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, decoded.userId), eq(roles.code, roleCode)));

    if (userRoleAssignment.length === 0) {
      return createErrorResponse(
        'FORBIDDEN',
        'User is not assigned to this role',
        [],
        403,
        correlationId
      );
    }

    const selectedRole = userRoleAssignment[0];

    // 2. Fetch person details for token payload
    const user = await db.query.userAccounts.findFirst({
      where: eq(userAccounts.id, decoded.userId),
      with: { person: true }
    });

    if (!user) {
      return createErrorResponse('NOT_FOUND', 'User not found', [], 404, correlationId);
    }

    const person = user.person as any;

    // 3. Issue new access token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      personId: user.personId,
      fullName: `${person.firstName} ${person.lastName}`,
      role: selectedRole.roleCode,
      scopeType: selectedRole.scopeType,
      scopeValue: selectedRole.scopeValue,
    };

    const newAccessToken = signAccessToken(tokenPayload);

    // 4. Update the active session in DB
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setHours(sessionExpiresAt.getHours() + 1);

    await db
      .update(sessions)
      .set({
        token: newAccessToken,
        activeRole: selectedRole.roleCode,
        activeScopeType: selectedRole.scopeType,
        activeScopeValue: selectedRole.scopeValue,
        expiresAt: sessionExpiresAt,
      })
      .where(eq(sessions.token, token));

    return createSuccessResponse(
      {
        activeRole: selectedRole.roleCode,
        activeScope: {
          type: selectedRole.scopeType,
          value: selectedRole.scopeValue,
        },
        accessToken: newAccessToken,
      },
      'Role switched successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Switch role error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
