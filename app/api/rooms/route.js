// app/api/rooms/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';

// 6-char uppercase alphanumeric code, no ambiguous chars (0/O, 1/I/L)
const generateRoomCode = customAlphabet('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 6);

const createRoomSchema = z.object({
  questionSetId: z.string().min(1, 'questionSetId is required'),
  settings: z
    .object({
      timeLimit: z.number().int().positive().optional(),
      scoringMode: z.enum(['STANDARD', 'SPEED', 'ACCURACY']).optional(),
      mode: z.enum(['SOLO', 'MULTI', 'TEAM']).optional(),
      allowSpectators: z.boolean().optional(),
    })
    .optional(),
});

// Try up to 5 times in case of (unlikely) code collision
async function createUniqueRoomCode() {
  for (let i = 0; i < 5; i++) {
    const code = generateRoomCode();
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error('Could not generate a unique room code');
}

export async function POST(req) {
  try {
    const rawText = await req.text();
    console.log('🔥 ROOM API RAW REQUEST:', rawText);

    let body;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 });
    }

    const data = createRoomSchema.parse(body);

    // ── Derive host from auth / fallback ──────────────────────────────
    const host = await prisma.user.findFirst();
    if (!host) {
      return NextResponse.json({ message: 'No user found to act as host.' }, { status: 400 });
    }

    const hostId = host.id;
    const collegeId = host.collegeId ?? null;

    // ── Verify question set exists ────────────────────────────────────
    const questionSet = await prisma.questionSet.findUnique({
      where: { id: data.questionSetId },
    });
    if (!questionSet) {
      return NextResponse.json({ message: 'Question set not found' }, { status: 404 });
    }

    // ── Generate unique room code ─────────────────────────────────────
    const code = await createUniqueRoomCode();

    // ── Create the room ───────────────────────────────────────────────
    const room = await prisma.room.create({
      data: {
        code,                                      // ✅ REQUIRED — now provided
        hostId,
        collegeId,
        questionSetId: data.questionSetId,
        status: 'LOBBY',
        settings: {
          timeLimit: data.settings?.timeLimit ?? 20,
          scoringMode: data.settings?.scoringMode ?? 'STANDARD',
          mode: data.settings?.mode ?? 'SOLO',
          allowSpectators: data.settings?.allowSpectators ?? true,
        },
      },
    });

    return NextResponse.json(
      { message: 'Room created', room },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ FINAL ERROR in /api/rooms:', error);

    if (error instanceof z.ZodError) {
      const issues = error.issues ?? error.errors ?? [];
      return NextResponse.json(
        { message: issues[0]?.message || 'Invalid data', issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}