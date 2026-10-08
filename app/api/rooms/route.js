import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation Schema for creating a Room
const createRoomSchema = z.object({
  hostId: z.string().min(1, 'Host ID is required'),
  collegeId: z.string().min(1, 'College ID is required'),
  questionSetId: z.string().min(1, 'Question Set ID is required'),
  settings: z.record(z.any()).optional().default({}),
});

// Helper function to generate a unique 6-character alphanumeric code
async function generateUniqueRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existingRoom = await prisma.room.findUnique({ where: { code } });
    if (!existingRoom) {
      isUnique = true;
    }
  }
  
  return code;
}

export async function POST(req) {
  try {
    // 1. Raw body padh lo debugging ke liye
    const rawText = await req.text();
    console.log("🔥 ROOM API RAW REQUEST:", rawText);

    let body;
    try {
      body = JSON.parse(rawText);
    } catch (parseError) {
      return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 });
    }

    // 2. Validate incoming data
    const validatedData = createRoomSchema.parse(body);

    // 3. Verify if QuestionSet exists
    const questionSet = await prisma.questionSet.findUnique({
      where: { id: validatedData.questionSetId },
    });
    if (!questionSet) {
      return NextResponse.json({ message: 'Invalid Question Set ID' }, { status: 400 });
    }

    // 4. Generate unique 6-char room code
    const roomCode = await generateUniqueRoomCode();

    // 5. Create the Room in Database
    const newRoom = await prisma.room.create({
      data: {
        code: roomCode,
        hostId: validatedData.hostId,
        collegeId: validatedData.collegeId,
        questionSetId: validatedData.questionSetId,
        settings: validatedData.settings || {},
        status: 'LOBBY',
      },
      include: {
        host: { select: { id: true, name: true, email: true } },
        college: { select: { id: true, name: true, code: true } },
        questionSet: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      { message: 'Room created successfully', room: newRoom }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ FINAL ERROR in /api/rooms:", error);

    // 🔥 Bulletproof Zod Error Handling
    // Pehle check karo ki 'errors' array hai ya nahi
    if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
      return NextResponse.json(
        { message: error.errors[0]?.message || 'Invalid data provided' }, 
        { status: 400 }
      );
    }
    
    // Agar Zod error nahi hai, toh normal error message bhejo
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}