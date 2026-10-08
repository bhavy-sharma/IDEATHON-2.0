// app/api/question-sets/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createQuestionSetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function POST(req) {
  try {
    const rawText = await req.text();
    console.log('🔥 RAW REQUEST TEXT:', rawText);

    let body;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 });
    }

    const data = createQuestionSetSchema.parse(body);

    const tempHost = await prisma.user.findFirst();
    if (!tempHost) {
      return NextResponse.json(
        { message: 'No user found to act as host.' },
        { status: 400 }
      );
    }

    const newQuestionSet = await prisma.questionSet.create({
      data: {
        name: data.name,
        description: data.description || null,
        hostId: tempHost.id,
      },
    });

    return NextResponse.json(
      { message: 'Question set created successfully', questionSet: newQuestionSet },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ FINAL ERROR:', error);

    if (error instanceof z.ZodError) {
      const issues = error.issues ?? error.errors ?? [];
      return NextResponse.json(
        { message: issues[0]?.message || 'Invalid data' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}