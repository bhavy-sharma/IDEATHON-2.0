import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const [questionSets, totalCount] = await Promise.all([
      prisma.questionSet.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          host: {
            select: { id: true, name: true, email: true }
          },
          questions: {
            select: { id: true } // 👈 Sirf id lao, taaki frontend ko .length mil jaye
          }
        }
      }),
      prisma.questionSet.count()
    ]);

    // 🔥 Frontend ke structure ke hisaab se response format karo
    return NextResponse.json({
      sets: questionSets.map(set => ({
        id: set.id,
        name: set.name,
        description: set.description,
        hostId: set.hostId,
        createdAt: set.createdAt,
        host: set.host,
        questions: set.questions, // 👈 Ab yeh array aayega, .length kaam karega
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching question sets:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}