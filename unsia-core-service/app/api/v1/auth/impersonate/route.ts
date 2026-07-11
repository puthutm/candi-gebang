import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userAccounts, roles, userRoles, sessions, impersonationLogs } from '@/db/schema';
import { verifyAccessToken, signAccessToken } from '@/lib/jwt';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    // 1. Authenticate Actor (Admin)
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('UNAUTHORIZED', 'Authentication token required', [], 401, correlationId);
    }

    const token = authHeader.substring(7);
    const actorPayload = verifyAccessToken(token) as any;

    if (!actorPayload) {
      return createErrorResponse('UNAUTHORIZED', 'Invalid or expired token', [], 401, correlationId);
    }

    // 2. Check if actor is Admin
    if (actorPayload.role !== 'super_admin' && actorPayload.role !== 'admin') {
      return createErrorResponse('FORBIDDEN', 'Only administrators can perform Login As', [], 403, correlationId);
    }

    const { targetUsername, reason } = await req.json();

    if (!targetUsername) {
      return createErrorResponse('VALIDATION_ERROR', 'Target username is required', [], 400, correlationId);
    }

    // 3. Find target user
    const targetUser = await db.query.userAccounts.findFirst({
      where: eq(userAccounts.username, targetUsername),
      with: {
        person: true,
      },
    });

    if (!targetUser || !targetUser.isActive) {
      return createErrorResponse('NOT_FOUND', 'Target user not found or inactive', [], 404, correlationId);
    }

    const targetPerson = targetUser.person as any;

    // 4. Fetch target user roles
    const assignedRoles = await db
      .select({
        roleId: roles.id,
        roleCode: roles.code,
        roleName: roles.name,
        scopeType: userRoles.scopeType,
        scopeValue: userRoles.scopeValue,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, targetUser.id));

    if (assignedRoles.length === 0) {
      return createErrorResponse('FORBIDDEN', 'Target user has no roles assigned', [], 403, correlationId);
    }

    const defaultRole = assignedRoles[0];

    // 5. Generate Target Access Token with Impersonator info
    const tokenPayload = {
      userId: targetUser.id,
      username: targetUser.username,
      email: targetUser.email,
      personId: targetUser.personId,
      fullName: `${targetPerson.firstName} ${targetPerson.lastName}`,
      role: defaultRole.roleCode,
      scopeType: defaultRole.scopeType,
      scopeValue: defaultRole.scopeValue,
      impersonatedBy: actorPayload.username, // Audit info in JWT
    };

    const targetAccessToken = signAccessToken(tokenPayload);

    // 6. Save target session to database
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setHours(sessionExpiresAt.getHours() + 1); // 1 hour

    await db.insert(sessions).values({
      userId: targetUser.id,
      token: targetAccessToken,
      activeRole: defaultRole.roleCode,
      activeScopeType: defaultRole.scopeType,
      activeScopeValue: defaultRole.scopeValue,
      expiresAt: sessionExpiresAt,
    });

    // 7. Write to Impersonation Logs
    await db.insert(impersonationLogs).values({
      actorId: actorPayload.userId,
      targetId: targetUser.id,
      reason: reason || 'Administratif Impersonation (Login As)',
      expiresAt: sessionExpiresAt,
    });

    return createSuccessResponse(
      {
        user: {
          id: targetUser.id,
          username: targetUser.username,
          email: targetUser.email,
          fullName: `${targetPerson.firstName} ${targetPerson.lastName}`,
        },
        activeRole: defaultRole.roleCode,
        activeScope: {
          type: defaultRole.scopeType,
          value: defaultRole.scopeValue,
        },
        roles: assignedRoles.map((r) => ({
          code: r.roleCode,
          name: r.roleName,
          scopeType: r.scopeType,
          scopeValue: r.scopeValue,
        })),
        accessToken: targetAccessToken,
      },
      `Successfully impersonated ${targetUser.username}`,
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return createErrorResponse('SERVER_ERROR', error.message || 'Internal server error', [], 500, correlationId);
  }
}
