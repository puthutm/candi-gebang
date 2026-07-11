import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { applications } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';
import { eq } from 'drizzle-orm';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;
  const { id } = params;

  try {
    const [deletedApp] = await db
      .delete(applications)
      .where(eq(applications.id, id))
      .returning();

    if (!deletedApp) {
      return createErrorResponse(
        'NOT_FOUND',
        'Application not found',
        [],
        404,
        correlationId
      );
    }

    return createSuccessResponse(deletedApp, 'Application deleted successfully', 200, correlationId);
  } catch (error: any) {
    console.error('Delete application error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
