import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { roles } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const allRoles = await db.select().from(roles);
    return createSuccessResponse(allRoles, 'Roles retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List roles error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
