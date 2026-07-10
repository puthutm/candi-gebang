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

    // 2. Call Finance Service (port 3005) to create registration fee invoice
    let financeResponseSuccess = false;
    let invoiceData: any = null;
    let errorMessage = '';

    try {
      const financeServiceUrl = process.env.FINANCE_SERVICE_URL || 'http://localhost:3005';
      const financeRes = await fetch(`${financeServiceUrl}/api/v1/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': correlationId,
        },
        body: JSON.stringify({
          billToType: 'APPLICANT',
          billToRefId: applicant.id,
          amount: '250000.00', // Registration fee constant
          description: `Biaya Pendaftaran PMB - ${applicant.biodata?.firstName || ''} ${applicant.biodata?.lastName || ''}`,
          items: [
            {
              itemCode: 'PMB_REG',
              itemName: 'Biaya Pendaftaran PMB',
              amount: '250000.00',
            },
          ],
        }),
      });

      const responseBody = await financeRes.json();
      if (financeRes.ok && responseBody.success) {
        invoiceData = responseBody.data;
        financeResponseSuccess = true;
      } else {
        errorMessage = responseBody.message || 'Finance Service rejected invoice creation';
      }
    } catch (e: any) {
      errorMessage = e.message || 'Could not connect to Finance Service';
    }

    if (!financeResponseSuccess) {
      return createErrorResponse(
        'FINANCE_INTEGRATION_FAILED',
        `Failed to request invoice from Finance service: ${errorMessage}`,
        [],
        502,
        correlationId
      );
    }

    return createSuccessResponse(
      {
        applicantId: applicant.id,
        invoice: invoiceData,
      },
      'Invoice requested and generated successfully',
      201,
      correlationId
    );
  } catch (error: any) {
    console.error('Invoice request error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
