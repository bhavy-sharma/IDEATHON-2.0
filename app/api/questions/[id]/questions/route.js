import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation Schema for creating a question
const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  timeLimit: z.number().int().min(5).max(300).default(30),
  imageUrl: z.string().optional(),
  tableData: z.any().optional(),
  options: z.array(z.object({
    text: z.string().min(1, 'Option text is required'),
    isCorrect: z.boolean(),
  })).min(2, 'At least 2 options are required'),
});

export async function POST(req, { params }) {
  try {
    const { id } = await params; // This is the questionSetId
    const body = await req.json();
    
    const validatedData = questionSchema.parse(body);

    // Check if the set exists
    const set = await prisma.questionSet.findUnique({ where: { id } });
    if (!set) {
      return NextResponse.json({ message: 'Question set not found' }, { status: 404 });
    }

    // Create question with nested options
    const newQuestion = await prisma.question.create({
      data: {
        text: validatedData.text,
        topic: validatedData.topic,
        difficulty: validatedData.difficulty,
        timeLimit: validatedData.timeLimit,
        imageUrl: validatedData.imageUrl || null,
        tableData: validatedData.tableData || null,
        questionSetId: id,
        options: {
          create: validatedData.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: {
        options: true, // Return the created question with its options
      },
    });

    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message || 'Invalid data' }, { status: 400 });
    }
    console.error('Error creating question:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}