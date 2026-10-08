import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    // Next.js 15 compatibility ke liye await params
    const { id } = await params;

    const questionSet = await prisma.questionSet.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { createdAt: 'asc' }, // Questions ko sequence mein lao
          include: {
            options: true, // Options bhi sath mein lao
          },
        },
      },
    });

    if (!questionSet) {
      return NextResponse.json({ message: 'Set not found' }, { status: 404 });
    }

    // Frontend expects { set: ... }
    return NextResponse.json({ set: questionSet });
  } catch (error) {
    console.error('Error fetching question set:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}