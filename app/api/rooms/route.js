// app/api/rooms/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';
import { randomBytes } from 'crypto';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[bytes[i] % chars.length];
  return code;
}

async function createUniqueRoomCode() {
  for (let i = 0; i < 5; i++) {
    const code = generateRoomCode();
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error('Could not generate unique room code');
}

const createRoomSchema = z.object({
  questionSetId: z.string().min(1),
  settings: z
    .object({
      timeLimit: z.number().int().positive().optional(),
      scoringMode: z.enum(['STANDARD', 'SPEED', 'ACCURACY']).optional(),
      mode: z.enum(['SOLO', 'MULTI', 'TEAM']).optional(),
      allowSpectators: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(req) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = createRoomSchema.parse(body);

    const questionSet = await prisma.questionSet.findUnique({
      where: { id: data.questionSetId },
    });
    if (!questionSet) {
      return NextResponse.json({ message: 'Set not found' }, { status: 404 });
    }

    const code = await createUniqueRoomCode();

    const room = await prisma.room.create({
      data: {
        code,
        hostId: user.id,
        collegeId: user.collegeId ?? null,
        questionSetId: data.questionSetId,
        status: 'LOBBY',
        settings: {
          timeLimit: data.settings?.timeLimit ?? 20,
          scoringMode: data.settings?.scoringMode ?? 'STANDARD',
          mode: data.settings?.mode ?? 'MULTI',
          allowSpectators: data.settings?.allowSpectators ?? true,
        },
      },
      include: { questionSet: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('❌ POST /api/rooms:', error);
    if (error.status === 401)
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    if (error instanceof z.ZodError) {
      const issues = error.issues ?? error.errors ?? [];
      return NextResponse.json({ message: issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    const rooms = await prisma.room.findMany({
      where: { hostId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { questionSet: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ rooms });
  } catch (error) {
    if (error.status === 401)
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}