// app/api/rooms/code/[code]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function GET(_req, { params }) {
  try {
    await requireUser();
    const { code } = await params;

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        questionSet: {
          include: {
            questions: {
              include: { options: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ room });
  } catch (error) {
    if (error.status === 401)
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}