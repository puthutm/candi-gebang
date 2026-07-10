import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { invoices, invoiceItems, clearances } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.query.invoices.findMany({
      with: {
        items: true,
        payments: true,
      },
    });
    return createSuccessResponse(list, 'Invoices retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List invoices error:', error);
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
    const { billToType, billToRefId, amount, description, items } = await req.json();

    if (!billToType || !billToRefId || !amount || !items || !Array.isArray(items)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'billToType, billToRefId, amount, and items (array) are required',
        [],
        400,
        correlationId
      );
    }

    const newInvoice = await db.transaction(async (tx) => {
      // 1. Generate unique invoice no
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const invoiceNo = `INV/${new Date().getFullYear()}/${randomSeq}`;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 days payment term

      // 2. Create invoice
      const [invRecord] = await tx
        .insert(invoices)
        .values({
          invoiceNo,
          billToType,
          billToRefId,
          amount,
          status: 'UNPAID',
          description,
          dueDate,
        })
        .returning();

      // 3. Create items
      for (const item of items) {
        await tx.insert(invoiceItems).values({
          invoiceId: invRecord.id,
          itemCode: item.itemCode,
          itemName: item.itemName,
          amount: item.amount,
        });
      }

      // 4. Create initial BLOCKED clearance for the subject (e.g. pmb applicant)
      await tx.insert(clearances).values({
        subjectRefId: billToRefId,
        subjectType: billToType,
        serviceCode: 'PMB_REGISTRATION',
        status: 'BLOCKED',
        reason: 'Belum melakukan pembayaran biaya pendaftaran',
      });

      return invRecord;
    });

    return createSuccessResponse(newInvoice, 'Invoice created successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
