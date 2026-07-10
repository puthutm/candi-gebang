import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { db } from '@/db/client';
import { userAccounts, persons, passwords, userRoles } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

// GET: List all users
export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.query.userAccounts.findMany({
      with: {
        person: true,
      },
    });

    const sanitizedList = list.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      person: user.person,
    }));

    return createSuccessResponse(sanitizedList, 'Users retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List users error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}

// POST: Create a new user (with person and default role)
export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const body = await req.json();
    const { username, password, email, firstName, lastName, phone, roleId } = body;

    // Basic validation
    if (!username || !password || !email || !firstName || !lastName || !roleId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Username, password, email, firstName, lastName, and roleId are required',
        [],
        400,
        correlationId
      );
    }

    // Wrap in database transaction
    const newUser = await db.transaction(async (tx) => {
      // 1. Create person record
      const [personRecord] = await tx
        .insert(persons)
        .values({
          firstName,
          lastName,
          email,
          phone,
        })
        .returning();

      // 2. Create user account
      const [userRecord] = await tx
        .insert(userAccounts)
        .values({
          personId: personRecord.id,
          username,
          email,
          isActive: true,
        })
        .returning();

      // 3. Hash and store password
      const hashedPassword = await bcrypt.hash(password, 10);
      await tx.insert(passwords).values({
        userId: userRecord.id,
        passwordHash: hashedPassword,
      });

      // 4. Assign role
      await tx.insert(userRoles).values({
        userId: userRecord.id,
        roleId,
        scopeType: 'global',
        scopeValue: 'all',
      });

      return {
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        person: personRecord,
      };
    });

    return createSuccessResponse(newUser, 'User created successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.code === '23505') {
      // Unique constraint violation in Postgres
      return createErrorResponse(
        'DUPLICATE_KEY',
        'Username or Email already exists',
        [],
        409,
        correlationId
      );
    }
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
