// app/api/rooms/[code]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const { code } = resolvedParams;

    if (!code) {
      return NextResponse.json({ message: 'Room code is required' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        host: { 
          select: { 
            id: true, 
            name: true,
            email: true 
          } 
        },
        college: { 
          select: { 
            id: true, 
            name: true, 
            code: true 
          } 
        },
        questionSet: { 
          select: { 
            id: true, 
            name: true 
          } 
        },
        players: {
          orderBy: { 
            score: 'desc' 
          },
          select: {
            id: true,
            name: true,
            score: true,
            accuracy: true,
            avgTime: true,
          },
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