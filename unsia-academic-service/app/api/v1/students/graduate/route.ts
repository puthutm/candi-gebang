import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { students, graduationRecords } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const { studentId, certificateNumber } = await req.json();

    if (!studentId) {
      return createErrorResponse('VALIDATION_ERROR', 'studentId is required', [], 400, correlationId);
    }

    // 1. Check Finance Clearance for GRADUATION
    let financeClearanceSuccess = false;
    let clearanceError = '';

    try {
      const financeServiceUrl = process.env.FINANCE_SERVICE_URL || 'http://localhost:3005';
      const financeRes = await fetch(
        `${financeServiceUrl}/api/v1/clearances?subjectRefId=${studentId}&serviceCode=GRADUATION`,
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
        clearanceError = responseBody.data?.reason || responseBody.message || 'Wisuda clearance blocked by Finance';
      }
    } catch (e: any) {
      clearanceError = e.message || 'Could not connect to Finance Service';
    }

    if (!financeClearanceSuccess) {
      return createErrorResponse(
        'CLEARANCE_BLOCKED',
        `Graduation Blocked: ${clearanceError}`,
        [],
        403,
        correlationId
      );
    }

    // 2. Perform Graduation inside academic service db
    const finalResult = await db.transaction(async (tx: any) => {
      // Create graduation record
      const [grad] = await tx
        .insert(graduationRecords)
        .values({
          studentId,
          graduationDate: new Date(),
          certificateNumber: certificateNumber || `CERT/UNSIA/${Date.now()}`,
          status: 'ALUMNI',
        })
        .returning();

      // Update student status
      await tx
        .update(students)
        .set({
          status: 'ALUMNI', // set student state to Alumni
          updatedAt: new Date(),
        })
        .where(eq(students.id, studentId));

      return grad;
    });

    return createSuccessResponse(finalResult, 'Student successfully graduated and onboarded into Alumni registry', 200, correlationId);
  } catch (error: any) {
    console.error('Graduation processing error:', error);
    return createErrorResponse('SERVER_ERROR', error.message || 'Internal server error', [], 500, correlationId);
  }
}
