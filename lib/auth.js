// lib/auth.js
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();       // ✅ await
  const userId =
    cookieStore.get('userId')?.value ||
    cookieStore.get('session')?.value;

  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  }
  return user;
}