import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createQuestionSetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  questions: z.array(z.any()).optional(),
});

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Data validate karo
    const validatedData = createQuestionSetSchema.parse(body);

    // Host ID find karo (Testing ke liye pehla user)
    const tempHost = await prisma.user.findFirst();
    const hostId = tempHost ? tempHost.id : "temp-host-id";

    if (!hostId) {
      return NextResponse.json({ message: 'No user found to act as host. Please register first.' }, { status: 400 });
    }

    // Database mein save karo
    const newQuestionSet = await prisma.questionSet.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        hostId: hostId,
      },
    });

    return NextResponse.json(
      { message: 'Question set created successfully', questionSet: newQuestionSet }, 
      { status: 201 }
    );

  } catch (error) {
    // 🔥 Bulletproof Error Handling
    // Check karo ki error.errors ek array hai ya nahi
    if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
      return NextResponse.json(
        { message: error.errors[0]?.message || 'Invalid data provided' }, 
        { status: 400 }
      );
    }

    // Agar ZodError nahi hai, toh normal error message dikhao
    console.error('Error creating question set:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}