import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { db } from '@/db/client';
import { userAccounts, passwords, persons, userRoles, roles, sessions, refreshTokens } from '@/db/schema';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;
  
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Username and password are required',
        [{ path: 'body', message: 'Missing fields' }],
        400,
        correlationId
      );
    }

    // 1. Fetch user account
    const user = await db.query.userAccounts.findFirst({
      where: eq(userAccounts.username, username),
      with: {
        person: true,
      },
    });

    if (!user || !user.isActive) {
      return createErrorResponse(
        'AUTHENTICATION_FAILED',
        'Invalid username or password',
        [],
        401,
        correlationId
      );
    }

    // 2. Fetch password record
    const pwdRecord = await db.query.passwords.findFirst({
      where: eq(passwords.userId, user.id),
    });

    if (!pwdRecord) {
      return createErrorResponse(
        'AUTHENTICATION_FAILED',
        'Authentication database error',
        [],
        401,
        correlationId
      );
    }

    // 3. Match password
    const isMatch = await bcrypt.compare(password, pwdRecord.passwordHash);
    if (!isMatch) {
      return createErrorResponse(
        'AUTHENTICATION_FAILED',
        'Invalid username or password',
        [],
        401,
        correlationId
      );
    }

    // 4. Fetch user roles & scopes
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

    // Use the first role as default active role
    const defaultRole = assignedRoles[0];

    // 5. Generate tokens
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

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ userId: user.id });

    // 6. Save Session & Refresh Token to DB
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setHours(sessionExpiresAt.getHours() + 1); // 1h expiry

    await db.insert(sessions).values({
      userId: user.id,
      token: accessToken,
      activeRole: defaultRole.roleCode,
      activeScopeType: defaultRole.scopeType,
      activeScopeValue: defaultRole.scopeValue,
      expiresAt: sessionExpiresAt,
    });

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7d expiry

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiresAt,
    });

    // 7. Success Response
    return createSuccessResponse(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: `${user.person.firstName} ${user.person.lastName}`,
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
        accessToken,
        refreshToken,
      },
      'Logged in successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
