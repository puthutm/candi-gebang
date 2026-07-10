import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lmsClasses, lmsEnrollments } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const { studentRefId, classOfferingIds, academicPeriodRefId } = await req.json();

    if (!studentRefId || !classOfferingIds || !Array.isArray(classOfferingIds)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'studentRefId and classOfferingIds (array) are required',
        [],
        400,
        correlationId
      );
    }

    const enrollmentsCount = await db.transaction(async (tx) => {
      let count = 0;
      for (const offeringId of classOfferingIds) {
        // Find corresponding LMS class
        const lmsClass = await tx.query.lmsClasses.findFirst({
          where: eq(lmsClasses.classOfferingRefId, offeringId),
        });

        if (lmsClass) {
          // Check if enrollment already exists
          const existing = await tx.query.lmsEnrollments.findFirst({
            where: eq(lmsEnrollments.lmsClassId, lmsClass.id),
          });

          if (!existing) {
            await tx.insert(lmsEnrollments).values({
              lmsClassId: lmsClass.id,
              studentRefId,
              status: 'ACTIVE',
            });
            count++;
          }
        }
      }
      return count;
    });

    return createSuccessResponse(
      { syncedCount: enrollmentsCount },
      'Student enrollments synced to LMS successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('LMS enrollment sync error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
