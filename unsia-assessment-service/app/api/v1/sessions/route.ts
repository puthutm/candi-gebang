import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { assessmentSessions } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.select().from(assessmentSessions);
    return createSuccessResponse(list, 'Assessment sessions retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List sessions error:', error);
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
    const { questionBankId, code, contextOwner, contextRefId, durationMinutes } = await req.json();

    if (!questionBankId || !code || !contextOwner || !contextRefId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'questionBankId, code, contextOwner, and contextRefId are required',
        [],
        400,
        correlationId
      );
    }

    const [inserted] = await db
      .insert(assessmentSessions)
      .values({
        questionBankId,
        code,
        contextOwner,
        contextRefId,
        durationMinutes: durationMinutes ?? 60,
      })
      .returning();

    return createSuccessResponse(inserted, 'Assessment session created successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create session error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
