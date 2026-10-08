// app/api/rooms/join/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  code: z.string().min(4).max(10).transform((s) => s.toUpperCase()),
});

export async function POST(req) {
  try {
    const user = await requireUser();
    const { code } = schema.parse(await req.json());

    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    if (error.status === 401)
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    if (error instanceof z.ZodError) {
      const issues = error.issues ?? error.errors ?? [];
      return NextResponse.json({ message: issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}