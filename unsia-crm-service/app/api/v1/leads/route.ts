import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { leads } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.select().from(leads);
    return createSuccessResponse(list, 'Leads retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List leads error:', error);
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
    const { campaignId, agentId, firstName, lastName, email, phone, source, studyProgramRefId } = await req.json();

    if (!firstName || !lastName || !email || !phone || !source) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'firstName, lastName, email, phone, and source are required',
        [],
        400,
        correlationId
      );
    }

    const [inserted] = await db
      .insert(leads)
      .values({
        campaignId,
        agentId,
        firstName,
        lastName,
        email,
        phone,
        source,
        status: 'NEW',
        studyProgramRefId,
      })
      .returning();

    return createSuccessResponse(inserted, 'Lead created successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create lead error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
