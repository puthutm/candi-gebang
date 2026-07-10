import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { studentGrades, classOfferings, courses, khsRecords, transcriptRecords } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;

  try {
    const { studentId, academicPeriodRefId } = await req.json();

    if (!studentId || !academicPeriodRefId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'studentId and academicPeriodRefId are required',
        [],
        400,
        correlationId
      );
    }

    // 1. Fetch student grades for class offerings in this academic period
    const grades = await db.query.studentGrades.findMany({
      where: eq(studentGrades.studentId, studentId),
      with: {
        // We will fetch the classOffering and corresponding course to obtain SKS/credits weight
      },
    });

    // To obtain credits, let's query courses associated with the student's grades
    let totalCredits = 0;
    let weightedPointsSum = 0;

    for (const g of grades) {
      const classOff = await db.query.classOfferings.findFirst({
        where: eq(classOfferings.id, g.classOfferingId),
      });

      if (classOff && classOff.academicPeriodRefId === academicPeriodRefId) {
        const crs = await db.query.courses.findFirst({
          where: eq(courses.id, classOff.courseId),
        });

        if (crs) {
          const credits = crs.credits;
          const gradePoint = parseFloat(g.gradePoint || '0.00');
          totalCredits += credits;
          weightedPointsSum += gradePoint * credits;
        }
      }
    }

    if (totalCredits === 0) {
      return createErrorResponse('NO_GRADES_FOUND', 'No student grades found for this period to finalize', [], 400, correlationId);
    }

    const ips = (weightedPointsSum / totalCredits).toFixed(2);

    const finalResult = await db.transaction(async (tx) => {
      // 2. Insert/Update KHS record
      const [khs] = await tx
        .insert(khsRecords)
        .values({
          studentId,
          academicPeriodRefId,
          ips,
          totalCredits,
          isLocked: true,
        })
        .onConflictDoUpdate({
          target: [khsRecords.studentId, khsRecords.academicPeriodRefId] as any, // fallback updates
          set: { ips, totalCredits, isLocked: true, updatedAt: new Date() },
        })
        .returning();

      // 3. Recalculate and update Cumulative GPA (IPK) in Transcript
      const allKhs = await tx.query.khsRecords.findMany({
        where: eq(khsRecords.studentId, studentId),
      });

      let totalCumulativeCredits = 0;
      let totalCumulativeWeightedPoints = 0;

      for (const k of allKhs) {
        totalCumulativeCredits += k.totalCredits;
        totalCumulativeWeightedPoints += parseFloat(k.ips) * k.totalCredits;
      }

      const ipk = totalCumulativeCredits > 0 
        ? (totalCumulativeWeightedPoints / totalCumulativeCredits).toFixed(2)
        : '0.00';

      const [transcript] = await tx
        .insert(transcriptRecords)
        .values({
          studentId,
          ipk,
          totalCreditsEarned: totalCumulativeCredits,
        })
        .onConflictDoUpdate({
          target: transcriptRecords.studentId,
          set: { ipk, totalCreditsEarned: totalCumulativeCredits, updatedAt: new Date() },
        })
        .returning();

      return { khs, transcript };
    });

    return createSuccessResponse(finalResult, 'Grades finalized and KHS generated successfully', 200, correlationId);
  } catch (error: any) {
    console.error('Finalize grades error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
