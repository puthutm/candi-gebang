import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { krsApplications, krsItems } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  const krsId = params.id;

  try {
    // 1. Fetch KRS Application details
    const krs = await db.query.krsApplications.findFirst({
      where: eq(krsApplications.id, krsId),
      with: {
        items: true,
      },
    });

    if (!krs) {
      return createErrorResponse('NOT_FOUND', 'KRS application not found', [], 404, correlationId);
    }

    if (krs.status === 'APPROVED') {
      return createErrorResponse('ALREADY_APPROVED', 'KRS is already approved', [], 400, correlationId);
    }

    // 2. Call Finance Service (port 3005) to check student clearance for KRS_FILLING
    let financeClearanceSuccess = false;
    let clearanceError = '';

    try {
      const financeServiceUrl = process.env.FINANCE_SERVICE_URL || 'http://localhost:3005';
      const financeRes = await fetch(
        `${financeServiceUrl}/api/v1/clearances?subjectRefId=${krs.studentId}&serviceCode=KRS_FILLING`,
        {
          headers: {
            'x-correlation-id': correlationId,
          },
        }
      );

      const responseBody = await financeRes.json();
      if (financeRes.ok && responseBody.success && responseBody.data.status === 'CLEARED') {
        financeClearanceSuccess = true;
      } else {
        clearanceError = responseBody.data?.reason || responseBody.message || 'KRS clearance blocked by Finance';
      }
    } catch (e: any) {
      clearanceError = e.message || 'Could not connect to Finance Service';
    }

    if (!financeClearanceSuccess) {
      return createErrorResponse(
        'CLEARANCE_BLOCKED',
        `KRS Approval rejected: ${clearanceError}`,
        [],
        403,
        correlationId
      );
    }

    // 3. Update KRS Application status to APPROVED in local DB
    await db.transaction(async (tx) => {
      await tx
        .update(krsApplications)
        .set({
          status: 'APPROVED',
          advisorApprovalStatus: 'APPROVED',
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(krsApplications.id, krsId));

      await tx
        .update(krsItems)
        .set({ status: 'APPROVED' })
        .where(eq(krsItems.krsApplicationId, krsId));
    });

    // 4. Contact LMS Service (port 3008) to sync student class enrollments
    let lmsSyncSuccess = false;
    let lmsError = '';

    try {
      const lmsServiceUrl = process.env.LMS_SERVICE_URL || 'http://localhost:3008';
      const lmsRes = await fetch(`${lmsServiceUrl}/api/v1/lms/enrollments/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': correlationId,
        },
        body: JSON.stringify({
          studentRefId: krs.studentId,
          classOfferingIds: krs.items.map((item) => item.classOfferingId),
          academicPeriodRefId: krs.academicPeriodRefId,
        }),
      });

      const responseBody = await lmsRes.json();
      if (lmsRes.ok && responseBody.success) {
        lmsSyncSuccess = true;
      } else {
        lmsError = responseBody.message || 'LMS rejected enrollment sync';
      }
    } catch (e: any) {
      lmsError = e.message || 'Could not connect to LMS Service';
    }

    return createSuccessResponse(
      {
        krsId,
        status: 'APPROVED',
        lmsSync: lmsSyncSuccess,
        lmsSyncNotes: lmsSyncSuccess ? 'Enrollments synced to LMS' : `Degraded Mode: ${lmsError}`,
      },
      'KRS approved and synchronized successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Approve KRS error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
