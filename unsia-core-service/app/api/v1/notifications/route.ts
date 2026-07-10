import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { notifications } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return createErrorResponse('VALIDATION_ERROR', 'userId query param is required', [], 400, correlationId);
  }

  try {
    const list = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: (notifications: any, { desc }: any) => [desc(notifications.createdAt)],
    });

    return createSuccessResponse(list, 'Notifications fetched successfully', 200, correlationId);
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return createErrorResponse('SERVER_ERROR', error.message || 'Internal server error', [], 500, correlationId);
  }
}

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const { userId, title, message, type } = await req.json();

    if (!userId || !title || !message) {
      return createErrorResponse('VALIDATION_ERROR', 'userId, title, and message are required', [], 400, correlationId);
    }

    const [newNotif] = await db
      .insert(notifications)
      .values({
        userId,
        title,
        message,
        type: type || 'INFO',
      })
      .returning();

    return createSuccessResponse(newNotif, 'Notification created successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create notification error:', error);
    return createErrorResponse('SERVER_ERROR', error.message || 'Internal server error', [], 500, correlationId);
  }
}
