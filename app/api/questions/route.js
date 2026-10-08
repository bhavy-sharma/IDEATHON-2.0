// app/api/questions/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  timeLimit: z.number().int().positive().optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Option text required'),
        isCorrect: z.boolean(),
      })
    )
    .min(2, 'At least 2 options required'),
  questionSetId: z.string().min(1, 'questionSetId is required'),
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

    console.log('✅ PARSED BODY:', body);

    const data = createQuestionSchema.parse(body);

    const question = await prisma.question.create({
      data: {
        text: data.text,
        topic: data.topic,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit ?? 20,
        questionSetId: data.questionSetId,
        options: {
          create: data.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json(
      { message: 'Question created successfully', question },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ ERROR:', error);

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