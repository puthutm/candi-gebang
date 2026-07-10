import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { employees, lecturers } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.query.lecturers.findMany({
      with: {
        employee: true,
      },
    });
    return createSuccessResponse(list, 'Lecturers retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List lecturers error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const { personRefId, employeeNip, nidn, isHomebase } = await req.json();

    if (!personRefId || !employeeNip) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'personRefId and employeeNip are required',
        [],
        400,
        correlationId
      );
    }

    const newLecturer = await db.transaction(async (tx) => {
      const [empRecord] = await tx
        .insert(employees)
        .values({
          personRefId,
          employeeNip,
          status: 'ACTIVE',
        })
        .returning();

      const [lecRecord] = await tx
        .insert(lecturers)
        .values({
          employeeId: empRecord.id,
          nidn,
          isHomebase: isHomebase ?? true,
        })
        .returning();

      return lecRecord;
    });

    return createSuccessResponse(newLecturer, 'Lecturer created successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create lecturer error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
