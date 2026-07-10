import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { sessions } from '@/db/schema';
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

    // Remove the session from database
    await db.delete(sessions).where(eq(sessions.token, token));

    return createSuccessResponse(
      null,
      'Logged out successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Logout error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
