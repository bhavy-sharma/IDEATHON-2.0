// app/api/questions/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params; // Next.js 15

    // Delete options first (in case of FK constraint)
    await prisma.option.deleteMany({ where: { questionId: id } });
    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ message: 'Question deleted' });
  } catch (error) {
    console.error('❌ DELETE ERROR:', error);
    return NextResponse.json({ message: 'Delete failed' }, { status: 500 });
  }
}