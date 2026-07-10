import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { studentGrades } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

function calculateGradeDetails(scoreNum: number) {
  if (scoreNum >= 85) return { gradeLetter: 'A', gradePoint: '4.00' };
  if (scoreNum >= 80) return { gradeLetter: 'A-', gradePoint: '3.70' };
  if (scoreNum >= 75) return { gradeLetter: 'B+', gradePoint: '3.30' };
  if (scoreNum >= 70) return { gradeLetter: 'B', gradePoint: '3.00' };
  if (scoreNum >= 65) return { gradeLetter: 'B-', gradePoint: '2.70' };
  if (scoreNum >= 60) return { gradeLetter: 'C+', gradePoint: '2.30' };
  if (scoreNum >= 55) return { gradeLetter: 'C', gradePoint: '2.00' };
  if (scoreNum >= 40) return { gradeLetter: 'D', gradePoint: '1.00' };
  return { gradeLetter: 'E', gradePoint: '0.00' };
}

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const { studentId, classOfferingId, score, attemptId } = await req.json();

    if (!studentId || !classOfferingId || score === undefined) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'studentId, classOfferingId, and score are required',
        [],
        400,
        correlationId
      );
    }

    const scoreNum = parseFloat(score);
    const { gradeLetter, gradePoint } = calculateGradeDetails(scoreNum);

    const [inserted] = await db
      .insert(studentGrades)
      .values({
        studentId,
        classOfferingId,
        score: scoreNum.toFixed(2),
        gradePoint,
        gradeLetter,
        attemptRefId: attemptId,
      })
      .returning();

    return createSuccessResponse(inserted, 'Grade input recorded successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Grade input error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
