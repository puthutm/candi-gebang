import { NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { students, studentBiodatas } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    const { applicantId, firstName, lastName, email, phone, studyProgramRefId, academicPeriodRefId } = await req.json();

    if (!applicantId || !firstName || !lastName || !email || !studyProgramRefId || !academicPeriodRefId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'applicantId, firstName, lastName, email, studyProgramRefId, and academicPeriodRefId are required',
        [],
        400,
        correlationId
      );
    }

    // 1. Idempotency Check: check if applicant was already handed over
    const existingStudent = await db.query.students.findFirst({
      where: eq(students.applicantRefId, applicantId),
    });

    if (existingStudent) {
      return createSuccessResponse(
        existingStudent,
        'Applicant was already handed over and registered as student (idempotent)',
        200,
        correlationId
      );
    }

    const newStudent = await db.transaction(async (tx) => {
      // 2. Generate sequential NIM (Nomor Induk Mahasiswa)
      // e.g. 26 (from year 2026) + 11 (study program digits) + sequential order
      const countRes = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(students)
        .where(eq(students.studyProgramRefId, studyProgramRefId));

      const count = countRes[0]?.count || 0;
      const sequenceStr = String(count + 1).padStart(4, '0');
      const yearPrefix = new Date().getFullYear().toString().substring(2);
      const nim = `${yearPrefix}${studyProgramRefId.substring(0, 2).toUpperCase()}${sequenceStr}`;

      // 3. Create student record
      const [insertedStudent] = await tx
        .insert(students)
        .values({
          nim,
          applicantRefId: applicantId,
          studyProgramRefId,
          academicPeriodRefId,
          status: 'ACTIVE',
        })
        .returning();

      // 4. Create student biodata copy
      await tx.insert(studentBiodatas).values({
        studentId: insertedStudent.id,
        firstName,
        lastName,
        address: 'Handed over from PMB',
      });

      return {
        id: insertedStudent.id,
        nim: insertedStudent.nim,
        status: insertedStudent.status,
      };
    });

    return createSuccessResponse(newStudent, 'Student onboarding handover completed successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Student handover error:', error);
    if (error.code === '23505') {
      return createErrorResponse(
        'DUPLICATE_KEY',
        'Student with this applicant reference already exists',
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
