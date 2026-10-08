'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

const KEY = 'aptiquiz:reconnect';

export function saveReconnectToken(roomCode, token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify({ roomCode, token }));
}

export function clearReconnectToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

export function getReconnectToken() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

export function useReconnect() {
  const pathname = usePathname();
  const { syncState, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    const saved = getReconnectToken();
    if (!saved) return;

    // Only auto-resync if we're on the correct game page
    if (pathname === `/game/${saved.roomCode}`) {
      syncState(saved.token);
    }
  }, [isConnected, pathname, syncState]);
}