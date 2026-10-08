// app/api/rooms/join/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';

const joinSchema = z.object({
  code: z.string().min(4).max(10).transform((s) => s.toUpperCase()),
});

export async function POST(req) {
  try {
    const user = await requireUser();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
    }

    const { code } = joinSchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        questionSet: { select: { id: true, name: true } },
      },
    });

    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    if (room.status === 'FINISHED' || room.status === 'CANCELLED') {
      return NextResponse.json({ message: 'Room is closed' }, { status: 400 });
    }

    // Upsert participant (create if not already in)
    const existing = await prisma.roomParticipant.findFirst({
      where: { roomId: room.id, userId: user.id },
    });

    if (!existing) {
      await prisma.roomParticipant.create({
        data: {
          roomId: room.id,
          userId: user.id,
          role: user.id === room.hostId ? 'HOST' : 'PLAYER',
        },
      });
    }

    return NextResponse.json({ message: 'Joined', room });
  } catch (error) {
    console.error('❌ POST /api/rooms/join ERROR:', error);

    if (error.status === 401) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
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