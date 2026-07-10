import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { applicants, biodatas } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  const applicantId = params.id;

  try {
    // 1. Fetch applicant & biodata details
    const applicant = await db.query.applicants.findFirst({
      where: eq(applicants.id, applicantId),
      with: { biodata: true },
    });

    if (!applicant) {
      return createErrorResponse('NOT_FOUND', 'Applicant not found', [], 404, correlationId);
    }

    if (applicant.status === 'HANDOVER_COMPLETED') {
      return createErrorResponse('ALREADY_HANDED_OVER', 'Applicant has already been handed over to Academic', [], 400, correlationId);
    }

    // 2. Contact Finance Service to check clearance status
    let financeClearanceSuccess = false;
    let clearanceError = '';

    try {
      const financeServiceUrl = process.env.FINANCE_SERVICE_URL || 'http://localhost:3005';
      const financeRes = await fetch(
        `${financeServiceUrl}/api/v1/clearances?subjectRefId=${applicant.id}&serviceCode=PMB_REGISTRATION`,
        {
          headers: {
            'x-correlation-id': correlationId,
          },
        }
      );

      const financeData = await financeRes.json();
      if (financeRes.ok && financeData.success && financeData.data.status === 'CLEARED') {
        financeClearanceSuccess = true;
      } else {
        clearanceError = financeData.data?.reason || financeData.message || 'Clearance blocked by Finance';
      }
    } catch (e: any) {
      clearanceError = e.message || 'Could not connect to Finance Service';
    }

    if (!financeClearanceSuccess) {
      return createErrorResponse(
        'HANDOVER_BLOCKED',
        `Cannot perform academic handover: ${clearanceError}`,
        [],
        403,
        correlationId
      );
    }

    // 3. Contact Academic Service to create student & generate NIM
    let academicHandoverSuccess = false;
    let studentData: any = null;
    let academicError = '';

    try {
      const academicServiceUrl = process.env.ACADEMIC_SERVICE_URL || 'http://localhost:3006';
      const academicRes = await fetch(`${academicServiceUrl}/api/v1/students/handover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': correlationId,
        },
        body: JSON.stringify({
          applicantId: applicant.id,
          firstName: applicant.biodata?.firstName || '',
          lastName: applicant.biodata?.lastName || '',
          email: applicant.email,
          phone: applicant.phone,
          studyProgramRefId: applicant.studyProgramRefId || crypto.randomUUID(), // default fallback if studyProgramRefId is missing
          academicPeriodRefId: applicant.studyProgramRefId || crypto.randomUUID(), // default period fallback
        }),
      });

      const academicData = await academicRes.json();
      if (academicRes.ok && academicData.success) {
        studentData = academicData.data;
        academicHandoverSuccess = true;
      } else {
        academicError = academicData.message || 'Academic service rejected student handover';
      }
    } catch (e: any) {
      academicError = e.message || 'Could not connect to Academic Service';
    }

    if (!academicHandoverSuccess) {
      return createErrorResponse(
        'ACADEMIC_INTEGRATION_FAILED',
        `Failed to onboard student in Academic service: ${academicError}`,
        [],
        502,
        correlationId
      );
    }

    // 4. Update applicant status in PMB DB
    await db
      .update(applicants)
      .set({ status: 'HANDOVER_COMPLETED', updatedAt: new Date() })
      .where(eq(applicants.id, applicantId));

    return createSuccessResponse(
      {
        applicantId: applicant.id,
        status: 'HANDOVER_COMPLETED',
        student: studentData,
      },
      'Applicant handed over to Academic successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Handover trigger error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
