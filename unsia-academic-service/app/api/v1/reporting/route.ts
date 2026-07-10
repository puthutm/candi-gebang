import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { students, transcriptRecords, krsItems } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    // 1. Fetch total student count
    const studentList = await db.query.students.findMany();
    const totalStudents = studentList.length;

    // 2. Fetch transcript statistics (IPK)
    const transcripts = await db.query.transcriptRecords.findMany();
    let ipkSum = 0;
    let totalCreditsAccumulated = 0;

    transcripts.forEach((t: any) => {
      ipkSum += parseFloat(t.ipk || '0.00');
      totalCreditsAccumulated += t.totalCreditsEarned;
    });

    const averageIpk = transcripts.length > 0 ? (ipkSum / transcripts.length).toFixed(2) : '0.00';

    // 3. Count SKS accumulated in KRS items
    const krsList = await db.query.krsItems.findMany();
    const totalKrsEnrollments = krsList.length;

    // 4. Aggregate IPK stats by Study Program
    const studyProgramAverages: { [key: string]: { sum: number, count: number } } = {};
    for (const t of transcripts) {
      const student = studentList.find((s: any) => s.id === t.studentId);
      if (student) {
        const prog = student.studyProgramId || 'General';
        if (!studyProgramAverages[prog]) {
          studyProgramAverages[prog] = { sum: 0, count: 0 };
        }
        studyProgramAverages[prog].sum += parseFloat(t.ipk);
        studyProgramAverages[prog].count += 1;
      }
    }

    const aggregatedProgStats = Object.entries(studyProgramAverages).map(([program, stat]) => ({
      studyProgramId: program,
      averageIpk: (stat.sum / stat.count).toFixed(2),
      studentCount: stat.count,
    }));

    const reportData = {
      totalStudents,
      averageIpk,
      totalCreditsAccumulated,
      totalKrsEnrollments,
      studyProgramAverages: aggregatedProgStats,
      generatedAt: new Date().toISOString(),
    };

    return createSuccessResponse(reportData, 'Data Mart reporting aggregates computed successfully', 200, correlationId);
  } catch (error: any) {
    console.error('Data mart report computation error:', error);
    return createErrorResponse('SERVER_ERROR', error.message || 'Internal server error', [], 500, correlationId);
  }
}
