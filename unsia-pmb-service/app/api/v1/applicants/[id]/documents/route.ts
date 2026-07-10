import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { documents, applicants } from '@/db/schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;
  const applicantId = params.id;

  try {
    const list = await db.select().from(documents).where(eq(documents.applicantId, applicantId));
    return createSuccessResponse(list, 'Applicant documents retrieved successfully', 200, correlationId);
  } catch (error: any) {
    console.error('List documents error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = req.headers.get('x-correlation-id') || undefined;
  const applicantId = params.id;

  try {
    const { documentTypeCode, fileUrl } = await req.json();

    if (!documentTypeCode || !fileUrl) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'documentTypeCode and fileUrl are required',
        [],
        400,
        correlationId
      );
    }

    const [inserted] = await db
      .insert(documents)
      .values({
        applicantId,
        documentTypeCode,
        fileUrl,
        status: 'PENDING',
      })
      .returning();

    // Check if we can automatically transition applicant status to DOCUMENTS_UPLOADED
    await db
      .update(applicants)
      .set({ status: 'DOCUMENTS_UPLOADED', updatedAt: new Date() })
      .where(eq(applicants.id, applicantId));

    return createSuccessResponse(inserted, 'Document uploaded successfully', 201, correlationId);
  } catch (error: any) {
    console.error('Create document error:', error);
    return createErrorResponse(
      'SERVER_ERROR',
      error.message || 'Internal server error',
      [],
      500,
      correlationId
    );
  }
}
