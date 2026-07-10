import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { courses } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.select().from(courses);
    return createSuccessResponse(list, 'Courses retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List courses error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
