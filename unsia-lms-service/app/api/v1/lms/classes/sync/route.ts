import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lmsClasses } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const { classOfferingId, className, courseRefId, academicPeriodRefId, lecturerRefId } = await req.json();

    if (!classOfferingId || !className || !courseRefId || !academicPeriodRefId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'classOfferingId, className, courseRefId, and academicPeriodRefId are required',
        [],
        400,
        correlationId
      );
    }

    // Check if class already exists in LMS
    const existing = await db.query.lmsClasses.findFirst({
      where: eq(lmsClasses.classOfferingRefId, classOfferingId),
    });

    if (existing) {
      return createSuccessResponse(
        existing,
        'Class offering already synced to LMS (idempotent)',
        200,
        correlationId
      );
    }

    const [inserted] = await db
      .insert(lmsClasses)
      .values({
        classOfferingRefId: classOfferingId,
        className,
        courseRefId,
        academicPeriodRefId,
        lecturerRefId,
      })
      .returning();

    return createSuccessResponse(inserted, 'Class synced to LMS successfully', 201, correlationId);
  } catch (error: any) {
    console.error('LMS class sync error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
