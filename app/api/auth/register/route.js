import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  collegeCode: z.string().min(1, 'College code is required'),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const college = await prisma.college.findUnique({
      where: { code: validatedData.collegeCode.toUpperCase() },
    });

    if (!college) {
      return NextResponse.json({ error: 'Invalid college code' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        collegeId: college.id,
        role: 'PLAYER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true,
      },
    });

    return NextResponse.json({ message: 'User registered successfully', user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}