// app/(dashboard)/room/[id]/page.jsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { roomApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, Users, Clock, Target, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

// Main component that uses params
function RoomContent() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the code from params (could be id or code)
  const roomCode = params?.id;

  useEffect(() => {
    if (!roomCode) return;

    async function fetchRoom() {
      try {
        setLoading(true);
        setError(null);
        
        // Try fetching by code
        const { data } = await roomApi.getByCode(roomCode);
        setRoom(data.room);
      } catch (err) {
        console.error('Failed to fetch room:', err);
        setError('Room not found or failed to load.');
      } finally {
        setLoading(false);
      }
    }

    fetchRoom();
  }, [roomCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Room Not Found</h2>
        <p className="mt-2 text-slate-500">{error || 'The room you are looking for does not exist.'}</p>
        <Button className="mt-6" onClick={() => router.push('/dashboard')}>
          <Home className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const players = room.players || [];
  const topPlayer = players.length > 0 ? players[0] : null;
  const hostName = room.host?.name || 'Unknown Host';
  const collegeName = room.college?.name || 'Unknown College';
  const questionSetName = room.questionSet?.name || 'Unknown Question Set';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Room Results</h1>
              <p className="text-xs text-slate-500">Code: {room.code}</p>
            </div>
          </div>
          <span className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            room.status === 'WAITING' ? "bg-amber-100 text-amber-700" :
            room.status === 'IN_PROGRESS' ? "bg-emerald-100 text-emerald-700" :
            "bg-slate-100 text-slate-700"
          )}>
            {room.status}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Top Performer */}
        {topPlayer && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 text-center shadow-sm">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-900">{topPlayer.name}</h2>
            <p className="text-amber-700 font-medium">Top Performer</p>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Target className="h-4 w-4" /> {topPlayer.accuracy ?? 0}% Accuracy
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="h-4 w-4" /> {topPlayer.avgTime ?? 0}s Avg Time
              </div>
              <div className="flex items-center gap-1.5 font-bold text-amber-700">
                <Trophy className="h-4 w-4" /> {topPlayer.score ?? 0} pts
              </div>
            </div>
          </div>
        )}

        {/* Room Info */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Host</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{hostName}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">College</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{collegeName}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Question Set</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{questionSetName}</p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Final Leaderboard
            </h3>
          </div>
          <div className="p-6 text-center text-slate-500">
            {players.length === 0 ? 'No players yet' : `${players.length} players joined`}
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <Home className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}

// Wrapper component with Suspense
export default function RoomResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading room...</p>
        </div>
      </div>
    }>
      <RoomContent />
    </Suspense>
  );
}