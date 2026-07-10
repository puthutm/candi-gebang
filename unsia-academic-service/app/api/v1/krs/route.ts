import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { krsApplications, krsItems } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.query.krsApplications.findMany({
      with: {
        items: {
          with: {
            classOffering: true,
          },
        },
      },
    });
    return createSuccessResponse(list, 'KRS applications retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List KRS applications error:', error);
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
    const { studentId, academicPeriodRefId, classOfferingIds } = await req.json();

    if (!studentId || !academicPeriodRefId || !classOfferingIds || !Array.isArray(classOfferingIds)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'studentId, academicPeriodRefId, and classOfferingIds (array) are required',
        [],
        400,
        correlationId
      );
    }

    const newKrs = await db.transaction(async (tx) => {
      // 1. Create KRS Application
      const [krsRecord] = await tx
        .insert(krsApplications)
        .values({
          studentId,
          academicPeriodRefId,
          status: 'SUBMITTED',
          advisorApprovalStatus: 'PENDING',
        })
        .returning();

      // 2. Add KRS items
      for (const offeringId of classOfferingIds) {
        await tx.insert(krsItems).values({
          krsApplicationId: krsRecord.id,
          classOfferingId: offeringId,
          status: 'PENDING',
        });
      }

      return krsRecord;
    });

    return createSuccessResponse(newKrs, 'KRS submitted successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Submit KRS error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
