// app/api/rooms/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    // Next.js 15 compatibility: await params
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ message: 'Room ID is required' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, email: true } },
        college: { select: { id: true, name: true, code: true } },
        questionSet: { select: { id: true, name: true } },
        players: { 
          orderBy: { score: 'desc' }, // ✅ Ensures top player is always index 0
          select: { 
            id: true, 
            name: true, 
            score: true, 
            accuracy: true, 
            avgTime: true 
          } 
        },
      },
    });

    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching room:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}