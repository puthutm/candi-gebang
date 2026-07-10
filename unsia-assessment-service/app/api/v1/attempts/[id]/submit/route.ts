import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { attempts, attemptAnswers, scoringResults, questionVersions, assessmentSessions } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  const attemptId = params.id;

  try {
    const { answers } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'answers array is required',
        [],
        400,
        correlationId
      );
    }

    // 1. Fetch Attempt & Session details
    const attempt = await db.query.attempts.findFirst({
      where: eq(attempts.id, attemptId),
      with: {
        session: true,
      },
    });

    if (!attempt) {
      return createErrorResponse('NOT_FOUND', 'Attempt not found', [], 404, correlationId);
    }

    if (attempt.status === 'SUBMITTED' || attempt.status === 'GRADED') {
      return createErrorResponse('ALREADY_SUBMITTED', 'Attempt is already submitted', [], 400, correlationId);
    }

    // 2. Score questions
    let correctCount = 0;
    const scoredAnswers: any[] = [];

    for (const ans of answers) {
      const qVer = await db.query.questionVersions.findFirst({
        where: eq(questionVersions.id, ans.questionVersionId),
      });

      if (qVer) {
        const isCorrect = qVer.correctKey === ans.selectedOptionKey;
        if (isCorrect) correctCount++;

        scoredAnswers.push({
          questionVersionId: ans.questionVersionId,
          selectedOptionKey: ans.selectedOptionKey,
          isCorrect,
          score: isCorrect ? '100.00' : '0.00',
        });
      }
    }

    const totalQuestions = scoredAnswers.length || 1;
    const finalScore = ((correctCount / totalQuestions) * 100).toFixed(2);

    // 3. Save answers and final score in transaction
    const finalResult = await db.transaction(async (tx) => {
      // Save attempt answers
      for (const sa of scoredAnswers) {
        await tx.insert(attemptAnswers).values({
          attemptId,
          questionVersionId: sa.questionVersionId,
          selectedOptionKey: sa.selectedOptionKey,
          isCorrect: sa.isCorrect,
          score: sa.score,
        });
      }

      // Save overall score
      const [scoreRecord] = await tx
        .insert(scoringResults)
        .values({
          attemptId,
          finalScore,
          correctCount,
          totalQuestions,
        })
        .returning();

      // Update attempt status
      await tx
        .update(attempts)
        .set({ status: 'GRADED', submittedAt: new Date() })
        .where(eq(attempts.id, attemptId));

      return scoreRecord;
    });

    // 4. If Context is LMS, sync grade to Academic Service Grade Input (port 3006)
    let academicGradeSync = false;
    let academicNotes = '';

    const session = attempt.session as any;
    if (session && session.contextOwner === 'LMS') {
      try {
        const academicServiceUrl = process.env.ACADEMIC_SERVICE_URL || 'http://localhost:3006';
        const gradeRes = await fetch(`${academicServiceUrl}/api/v1/grades/input`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-correlation-id': correlationId,
          },
          body: JSON.stringify({
            studentId: attempt.participantRefId,
            classOfferingId: session.contextRefId,
            score: finalScore,
            attemptId,
          }),
        });

        const gradeData = await gradeRes.json();
        if (gradeRes.ok && gradeData.success) {
          academicGradeSync = true;
          academicNotes = 'Grade successfully pushed to Academic';
        } else {
          academicNotes = gradeData.message || 'Academic rejected grade input';
        }
      } catch (e: any) {
        academicNotes = e.message || 'Could not connect to Academic Service';
      }
    }

    return createSuccessResponse(
      {
        attemptId,
        score: finalResult,
        gradeSync: academicGradeSync,
        gradeSyncNotes: academicNotes,
      },
      'Attempt submitted and graded successfully',
      200,
      correlationId
    );
  } catch (error: any) {
    console.error('Submit attempt error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
