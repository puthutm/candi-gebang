import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { khsRecords } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const academicPeriodRefId = searchParams.get('academicPeriodRefId');

  if (!studentId || !academicPeriodRefId) {
    return createErrorResponse(
      'VALIDATION_ERROR',
      'studentId and academicPeriodRefId query params are required',
      [],
      400,
      correlationId
    );
  }

  try {
    // 1. Call Finance Service (port 3005) to check clearance for KHS_VIEWING
    let financeClearanceSuccess = false;
    let clearanceError = '';

    try {
      const financeServiceUrl = process.env.FINANCE_SERVICE_URL || 'http://localhost:3005';
      const financeRes = await fetch(
        `${financeServiceUrl}/api/v1/clearances?subjectRefId=${studentId}&serviceCode=KHS_VIEWING`,
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
        clearanceError = responseBody.data?.reason || responseBody.message || 'KHS viewing clearance blocked by Finance';
      }
    } catch (e: any) {
      clearanceError = e.message || 'Could not connect to Finance Service';
    }

    if (!financeClearanceSuccess) {
      return createErrorResponse(
        'CLEARANCE_BLOCKED',
        `KHS Access Blocked: ${clearanceError}`,
        [],
        403,
        correlationId
      );
    }

    // 2. Fetch KHS record
    const khs = await db.query.khsRecords.findFirst({
      where: and(
        eq(khsRecords.studentId, studentId),
        eq(khsRecords.academicPeriodRefId, academicPeriodRefId)
      ),
    });

    if (!khs) {
      return createErrorResponse('NOT_FOUND', 'KHS record not found for this period', [], 404, correlationId);
    }

    return createSuccessResponse(khs, 'KHS retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('Fetch KHS error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
