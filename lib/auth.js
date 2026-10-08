// lib/auth.js
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';   // ← remove if you use jose instead

const JWT_SECRET = process.env.JWT_SECRET;

export async function getCurrentUser() {
  // ✅ await cookies() — Next.js 15/16 requirement
  const cookieStore = await cookies();

  const token =
    cookieStore.get('session')?.value ||
    cookieStore.get('token')?.value ||
    cookieStore.get('userId')?.value;   // fallback if you use that shortcut

  if (!token) return null;

  try {
    // ── If you store a raw userId in the cookie (dev shortcut) ──────
    // (skip this block and just use token as userId)
    // return prisma.user.findUnique({ where: { id: token } });

    // ── If you store a JWT ──────────────────────────────────────────
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.userId ?? payload.id;
    if (!userId) return null;

    return prisma.user.findUnique({ where: { id: userId } });
  } catch {
    return null; // invalid / expired token
  }
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