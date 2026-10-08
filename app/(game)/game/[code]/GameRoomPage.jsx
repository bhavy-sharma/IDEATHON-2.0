// app/(game)/game/[code]/GameRoomPage.jsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ArrowLeft, Play, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function GameRoomPage({ code }) {
  const router = useRouter();
  const socketRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [memberIds, setMemberIds] = useState([]);
  const [connected, setConnected] = useState(false);

  // ── Load room data ───────────────────────────────────────────────
  const loadRoom = useCallback(async () => {
    if (!code || code === 'undefined') {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/rooms/code/${code}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Room not found');
      setRoom(data.room);
    } catch (err) {
      toast({
        title: 'Failed to load room',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  // ── Socket connection ────────────────────────────────────────────
  useEffect(() => {
    if (!code || code === 'undefined') return;

    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      socket.emit('room:join', { code });
    };

    const onDisconnect = () => setConnected(false);

    const onMembers = ({ count, members }) => {
      console.log('👥 members update:', count);
      setMemberCount(count ?? 0);
      setMemberIds(members ?? []);
    };

    const onJoined = () => {
      console.log('✅ joined room', code);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room:members', onMembers);
    socket.on('room:joined', onJoined);

    // If already connected (re-entering page), join immediately
    if (socket.connected) {
      socket.emit('room:join', { code });
      setConnected(true);
    }

    return () => {
      socket.emit('room:leave', { code });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room:members', onMembers);
      socket.off('room:joined', onJoined);
    };
  }, [code]);

  // ── Loading / not found ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading room…
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Room not found.</p>
        <Button onClick={() => router.push('/dashboard')}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                Room <span className="font-mono">{room.code}</span>
              </h1>
              <p className="text-xs text-slate-500">
                {room.questionSet?.name ?? 'No set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">{memberCount}</span>
            </div>
            <span
              className={
                'h-2 w-2 rounded-full ' +
                (connected ? 'bg-emerald-500' : 'bg-slate-400')
              }
              title={connected ? 'Connected' : 'Disconnected'}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Status card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">Waiting for players…</h2>
          <p className="text-sm text-slate-500">
            Share the code <span className="font-mono font-bold">{room.code}</span> with
            players. When they join, the count above updates in real time.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: memberCount }).map((_, i) => (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600"
              >
                P{i + 1}
              </div>
            ))}
            {memberCount === 0 && (
              <p className="text-sm text-slate-400">No one here yet.</p>
            )}
          </div>

          {memberCount >= 2 && (
            <div className="mt-6 flex items-center gap-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              <Check className="h-4 w-4" /> Ready to start!
            </div>
          )}
        </div>

        {/* Host controls */}
        <div className="flex justify-end gap-3">
          <Button
            disabled={memberCount < 1}
            onClick={() => {
              const socket = socketRef.current;
              if (socket) socket.emit('room:start', { code });
              toast({ title: 'Starting game…' });
              // router.push(`/game/${code}/play`);
            }}
          >
            <Play className="mr-2 h-4 w-4" /> Start Game
          </Button>
        </div>
      </main>
    </div>
  );
}