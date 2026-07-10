import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { invoices, payments, clearances } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const { providerEventId, invoiceNo, amountPaid, paymentMethodCode } = await req.json();

    if (!providerEventId || !invoiceNo || !amountPaid || !paymentMethodCode) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'providerEventId, invoiceNo, amountPaid, and paymentMethodCode are required',
        [],
        400,
        correlationId
      );
    }

    // 1. Idempotency Check: check if this payment event was already processed
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.providerEventId, providerEventId),
    });

    if (existingPayment) {
      // Already processed, return success immediately (idempotent duplicate handler)
      return createSuccessResponse(
        { providerEventId, status: 'PROCESSED_ALREADY' },
        'Payment callback already processed (idempotent)',
        200,
        correlationId
      );
    }

    // 2. Fetch corresponding invoice
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.invoiceNo, invoiceNo),
    });

    if (!invoice) {
      return createErrorResponse('NOT_FOUND', 'Invoice not found', [], 404, correlationId);
    }

    if (invoice.status === 'PAID') {
      return createSuccessResponse(
        { invoiceNo, status: 'PAID' },
        'Invoice was already paid',
        200,
        correlationId
      );
    }

    // 3. Process payment update inside a transaction
    await db.transaction(async (tx) => {
      // Create payment transaction log
      await tx.insert(payments).values({
        invoiceId: invoice.id,
        providerEventId,
        paymentMethodCode,
        amountPaid,
        paidAt: new Date(),
      });

      // Update invoice status to PAID
      await tx
        .update(invoices)
        .set({ status: 'PAID', updatedAt: new Date() })
        .where(eq(invoices.id, invoice.id));

      // Update academic clearance status of the subject to CLEARED
      await tx
        .update(clearances)
        .set({
          status: 'CLEARED',
          reason: 'Lunas biaya pendaftaran PMB',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(clearances.subjectRefId, invoice.billToRefId),
            eq(clearances.serviceCode, 'PMB_REGISTRATION')
          )
        );
    });

    return createSuccessResponse(
      {
        invoiceNo,
        status: 'PAID',
        clearanceStatus: 'CLEARED',
      },
      'Payment processed and clearance updated successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Payment callback error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
