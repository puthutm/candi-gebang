import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lecturers } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;
  const lecturerId = params.id;

  try {
    const record = await db.query.lecturers.findFirst({
      where: eq(lecturers.id, lecturerId),
      with: {
        employee: true,
      },
    });

    if (!record) {
      return createErrorResponse('NOT_FOUND', 'Lecturer not found', [], 404, correlationId);
    }

    return createSuccessResponse(
      {
        lecturerId: record.id,
        nidn: record.nidn,
        status: record.employee.status,
        isEligible: record.employee.status === 'ACTIVE',
      },
      'Lecturer status retrieved successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Check lecturer status error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
