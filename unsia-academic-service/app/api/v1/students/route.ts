import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { students } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.query.students.findMany({
      with: {
        biodata: true,
        clearanceSnapshots: true,
      },
    });
    return createSuccessResponse(list, 'Students retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List students error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
