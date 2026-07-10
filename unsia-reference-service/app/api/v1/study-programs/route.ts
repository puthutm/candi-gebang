import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { studyPrograms } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.select().from(studyPrograms);
    return createSuccessResponse(list, 'Study programs retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List study programs error:', error);
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
    const { code, name, level } = await req.json();

    if (!code || !name || !level) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Code, name, and level are required',
        [],
        400,
        correlationId
      );
    }

    const [inserted] = await db
      .insert(studyPrograms)
      .values({
        code,
        name,
        level,
        isActive: true,
      })
      .returning();

    return createSuccessResponse(inserted, 'Study program created successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create study program error:', error);
    if (error.code === '23505') {
      return createErrorResponse(
        'DUPLICATE_KEY',
        'Study program code already exists',
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
