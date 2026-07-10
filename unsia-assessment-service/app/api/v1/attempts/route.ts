import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { attempts, assessmentSessions, questionVersions } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const { sessionId, participantRefId } = await req.json();

    if (!sessionId || !participantRefId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'sessionId and participantRefId are required',
        [],
        400,
        correlationId
      );
    }

    // 1. Fetch Session details
    const session = await db.query.assessmentSessions.findFirst({
      where: eq(assessmentSessions.id, sessionId),
      with: {
        bank: {
          with: {
            questions: {
              with: {
                versions: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return createErrorResponse('NOT_FOUND', 'Session not found', [], 404, correlationId);
    }

    // 2. Check if attempt already exists in progress
    const existing = await db.query.attempts.findFirst({
      where: and(
        eq(attempts.assessmentSessionId, sessionId),
        eq(attempts.participantRefId, participantRefId),
        eq(attempts.status, 'IN_PROGRESS')
      ),
    });

    if (existing) {
      return createSuccessResponse(existing, 'Active attempt already in progress (idempotent)', 200, correlationId);
    }

    // 3. Create new attempt
    const [newAttempt] = await db
      .insert(attempts)
      .values({
        assessmentSessionId: sessionId,
        participantRefId,
        status: 'IN_PROGRESS',
      })
      .returning();

    // 4. Return attempt info with sanitized questions (remove correct answers/correct keys!)
    const activeQuestions = session.bank.questions.map((q) => {
      const activeVer = q.versions.find((v) => v.isActive);
      return {
        questionId: q.id,
        questionVersionId: activeVer?.id,
        content: activeVer?.content,
        options: activeVer?.optionsJson,
        type: q.type,
      };
    });

    return createSuccessResponse(
      {
        attemptId: newAttempt.id,
        status: newAttempt.status,
        startedAt: newAttempt.startedAt,
        questions: activeQuestions,
      },
      'Attempt started successfully',
      201,
      correlationId
    );
  } catch (error: any) {
    console.error('Start attempt error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
