import { NextResponse } from 'next/server';
import { MetaEnvelope, SuccessEnvelope, ErrorEnvelope } from '@unsia/shared-contracts';

export function getMetadata(correlationId?: string, pagination?: any): MetaEnvelope {
  return {
    trace_id: crypto.randomUUID(),
    correlation_id: correlationId || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    api_version: 'v1',
    pagination,
  };
}

export function createSuccessResponse<T>(
  data: T,
  message = 'Request processed successfully',
  status = 200,
  correlationId?: string,
  pagination?: any
) {
  const envelope: SuccessEnvelope<T> = {
    success: true,
    message,
    data,
    meta: getMetadata(correlationId, pagination),
  };
  return NextResponse.json(envelope, { status });
}

export function createErrorResponse(
  code: string,
  message: string,
  details: any[] = [],
  status = 400,
  correlationId?: string
) {
  const envelope: ErrorEnvelope = {
    success: false,
    message,
    error: {
      code,
      details,
    },
    meta: getMetadata(correlationId),
  };
  return NextResponse.json(envelope, { status });
}
