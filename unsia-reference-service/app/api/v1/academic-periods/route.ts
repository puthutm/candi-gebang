import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { academicPeriods } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.select().from(academicPeriods);
    return createSuccessResponse(list, 'Academic periods retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List academic periods error:', error);
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
    const { academicYearId, code, name, termCode, startDate, endDate } = await req.json();

    if (!academicYearId || !code || !name || !termCode || !startDate || !endDate) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'academicYearId, code, name, termCode, startDate, and endDate are required',
        [],
        400,
        correlationId
      );
    }

    const [inserted] = await db
      .insert(academicPeriods)
      .values({
        academicYearId,
        code,
        name,
        termCode,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      })
      .returning();

    return createSuccessResponse(inserted, 'Academic period created successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create academic period error:', error);
    if (error.code === '23505') {
      return createErrorResponse(
        'DUPLICATE_KEY',
        'Academic period code already exists',
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
