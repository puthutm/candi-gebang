import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { clearances } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;
  
  const { searchParams } = new URL(req.url);
  const subjectRefId = searchParams.get('subjectRefId');
  const serviceCode = searchParams.get('serviceCode');

  if (!subjectRefId || !serviceCode) {
    return createErrorResponse(
      'VALIDATION_ERROR',
      'subjectRefId and serviceCode query params are required',
      [],
      400,
      correlationId
    );
  }

  try {
    const record = await db.query.clearances.findFirst({
      where: and(
        eq(clearances.subjectRefId, subjectRefId),
        eq(clearances.serviceCode, serviceCode)
      ),
    });

    if (!record) {
      return createSuccessResponse(
        { status: 'BLOCKED', reason: 'Clearance record not found (default blocked)' },
        'Clearance status (default fallback)',
        200,
        correlationId
      );
    }

    return createSuccessResponse(
      {
        subjectRefId: record.subjectRefId,
        serviceCode: record.serviceCode,
        status: record.status,
        reason: record.reason,
        updatedAt: record.updatedAt,
      },
      'Clearance status retrieved successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Check clearance error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
