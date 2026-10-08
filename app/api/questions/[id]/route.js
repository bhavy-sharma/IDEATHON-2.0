import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    // Question delete karo (Prisma schema mein onDelete: Cascade hai, 
    // toh iske options aur answers apne aap delete ho jayenge)
    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ message: 'Failed to delete question' }, { status: 500 });
  }
}