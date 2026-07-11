import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { applications } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';
import { eq } from 'drizzle-orm';

// GET: Retrieve all applications
export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const list = await db.select().from(applications).orderBy(applications.name);
    return createSuccessResponse(list, 'Applications retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List applications error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}

// POST: Add a new application
export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const body = await req.json();
    const { code, name, description, url } = body;

    if (!code || !name || !url) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Application code, name, and URL are required',
        [],
        400,
        correlationId
      );
    }

    const [newApp] = await db
      .insert(applications)
      .values({
        code,
        name,
        description: description || null,
        url,
      })
      .returning();

    return createSuccessResponse(newApp, 'Application registered successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create application error:', error);
    if (error.code === '23505') {
      return createErrorResponse(
        'DUPLICATE_KEY',
        'Application code already exists',
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
