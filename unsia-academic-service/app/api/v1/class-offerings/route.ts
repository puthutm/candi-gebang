import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { classOfferings } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.select().from(classOfferings);
    return createSuccessResponse(list, 'Class offerings retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List class offerings error:', error);
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
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const { courseId, academicPeriodRefId, className, lecturerRefId, capacity } = await req.json();

    if (!courseId || !academicPeriodRefId || !className) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'courseId, academicPeriodRefId, and className are required',
        [],
        400,
        correlationId
      );
    }

    const [inserted] = await db
      .insert(classOfferings)
      .values({
        courseId,
        academicPeriodRefId,
        className,
        lecturerRefId,
        capacity: capacity ?? 50,
      })
      .returning();

    // Trigger LMS Class Sync (port 3008)
    let lmsSyncSuccess = false;
    let lmsError = '';
    try {
      const lmsRes = await fetch('http://localhost:3008/api/v1/lms/classes/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': correlationId,
        },
        body: JSON.stringify({
          classOfferingId: inserted.id,
          className: inserted.className,
          courseRefId: courseId,
          academicPeriodRefId,
          lecturerRefId,
        }),
      });

      const responseBody = await lmsRes.json();
      if (lmsRes.ok && responseBody.success) {
        lmsSyncSuccess = true;
      } else {
        lmsError = responseBody.message || 'LMS rejected class sync';
      }
    } catch (e: any) {
      lmsError = e.message || 'Could not connect to LMS Service';
    }

    return createSuccessResponse(
      {
        classOffering: inserted,
        lmsSync: lmsSyncSuccess,
        lmsSyncNotes: lmsSyncSuccess ? 'Synced to LMS' : `Degraded Mode: ${lmsError}`,
      },
      'Class offering created successfully',
      201,
      correlationId
    );
  } catch (error: any) {
    console.error('Create class offering error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
