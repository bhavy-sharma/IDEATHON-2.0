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
    // 1. Sabse pehle RAW text padho (Yeh sabse important step hai)
    const rawText = await req.text();
    console.log("🔥 RAW REQUEST TEXT AAYA HAI:", rawText);

    // 2. Usko JSON mein convert karo
    let body;
    try {
      body = JSON.parse(rawText);
      console.log("✅ PARSED BODY:", body);
    } catch (parseError) {
      return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 });
    }

    // 3. Ab Zod se validate karo
    const validatedData = createQuestionSetSchema.parse(body);

    // 4. Host ID find karo
    const tempHost = await prisma.user.findFirst();
    const hostId = tempHost ? tempHost.id : "temp-host-id";

    if (!hostId) {
      return NextResponse.json({ message: 'No user found to act as host.' }, { status: 400 });
    }

    // 5. Database mein save karo
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
    console.error("❌ FINAL ERROR:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message || 'Invalid data' }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}