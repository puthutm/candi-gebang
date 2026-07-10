import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { followUps } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;
  const leadId = params.id;

  try {
    const list = await db.select().from(followUps).where(eq(followUps.leadId, leadId));
    return createSuccessResponse(list, 'Followups retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List followups error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;
  const leadId = params.id;

  try {
    const { agentId, notes, nextAction } = await req.json();

    if (!agentId || !notes) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'agentId and notes are required',
        [],
        400,
        correlationId
      );
    }

    const [inserted] = await db
      .insert(followUps)
      .values({
        leadId,
        agentId,
        notes,
        nextAction,
      })
      .returning();

    return createSuccessResponse(inserted, 'Followup logged successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create followup error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
