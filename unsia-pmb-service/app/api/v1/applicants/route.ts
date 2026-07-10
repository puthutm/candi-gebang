import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { applicants, biodatas } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.query.applicants.findMany({
      with: {
        biodata: true,
        documents: true,
      },
    });
    return createSuccessResponse(list, 'Applicants retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List applicants error:', error);
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
    const { firstName, lastName, email, phone, leadRefId, studyProgramRefId } = await req.json();

    if (!firstName || !lastName || !email || !phone) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'firstName, lastName, email, and phone are required',
        [],
        400,
        correlationId
      );
    }

    const newApplicant = await db.transaction(async (tx) => {
      // 1. Create applicant
      const [appRecord] = await tx
        .insert(applicants)
        .values({
          leadRefId,
          email,
          phone,
          status: 'REGISTERED',
          studyProgramRefId,
        })
        .returning();

      // 2. Create biodata
      await tx.insert(biodatas).values({
        applicantId: appRecord.id,
        firstName,
        lastName,
      });

      return appRecord;
    });

    return createSuccessResponse(newApplicant, 'Applicant registered successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Register applicant error:', error);
    if (error.code === '23505') {
      return createErrorResponse(
        'DUPLICATE_KEY',
        'Applicant email already registered',
        [],
        409,
        correlationId
      );
    }
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
