// app/api/question-sets/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema to validate the ID parameter
const deleteSchema = z.object({
  id: z.string().min(1, 'Question set ID is required'),
});

export async function DELETE(req, { params }) {
  try {
    // Note: In Next.js 15, `params` is a Promise. In Next.js 14, it's an object.
    // Using `await` ensures compatibility with Next.js 15+. 
    // If you are strictly on Next.js 14, you can remove the `await`.
    const resolvedParams = await params;
    
    const validation = deleteSchema.safeParse({ id: resolvedParams.id });

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid or missing question set ID' },
        { status: 400 }
      );
    }

    const { id } = validation.data;

    // Optional but recommended: Verify the question set exists before deleting
    const existingQuestionSet = await prisma.questionSet.findUnique({
      where: { id },
    });

    if (!existingQuestionSet) {
      return NextResponse.json(
        { message: 'Question set not found' },
        { status: 404 }
      );
    }

    // TODO: Add Authorization check here (e.g., ensure req.user.id === existingQuestionSet.hostId)

    // Delete the question set
    await prisma.questionSet.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Question set deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ DELETE QUESTION SET ERROR:', error);

    // Handle Prisma's specific "Record to delete does not exist" error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Question set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}