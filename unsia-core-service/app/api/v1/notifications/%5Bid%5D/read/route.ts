import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { notifications } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  const id = params.id;

  try {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();

    if (!updated) {
      return createErrorResponse('NOT_FOUND', 'Notification not found', [], 404, correlationId);
    }

    return createSuccessResponse(updated, 'Notification marked as read', 200, correlationId);
  } catch (error: any) {
    console.error('Update notification error:', error);
    return createErrorResponse('SERVER_ERROR', error.message || 'Internal server error', [], 500, correlationId);
  }
}
