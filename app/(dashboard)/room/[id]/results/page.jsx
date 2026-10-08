'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { roomApi } from '@/lib/api'; // Ensure this points to your API helper
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  Clock, 
  Target, 
  Download,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoomResultsPage() {
  const params = useParams();
  const router = useRouter();
  
  // Handle both Next.js 14 (object) and Next.js 15 (Promise) params safely
  const [id, setId] = useState(null);

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setId(resolvedParams?.id);
    }
    resolveParams();
  }, [params]);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchRoom() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await roomApi.getById(id);
        setRoom(data.room);
      } catch (err) {
        console.error('Failed to fetch room:', err);
        setError('Room not found or failed to load.');
      } finally {
        setLoading(false);
      }
    }

    fetchRoom();
  }, [id]);

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

  // ✅ Safely access players array to prevent .map() or [0] crashes
  const players = room.players || [];
  const topPlayer = players.length > 0 ? players[0] : null;

  // ✅ Safely access nested Prisma relations (matches your backend 'include')
  const hostName = room.host?.name || 'Unknown Host';
  const collegeName = room.college?.name || 'Unknown College';
  const questionSetName = room.questionSet?.name || 'Unknown Question Set';

  // ✅ Dynamic status badge mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'WAITING':
        return "bg-amber-100 text-amber-700";
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return "bg-emerald-100 text-emerald-700";
      case 'FINISHED':
      case 'ENDED':
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

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
            getStatusBadge(room.status)
          )}>
            {room.status?.replace('_', ' ')}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        
        {/* Top Performer Highlight */}
        {topPlayer ? (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 text-center shadow-sm">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-900">{topPlayer.name}</h2>
            <p className="text-amber-700 font-medium">Top Performer</p>
            <div className="mt-4 flex justify-center gap-6 text-sm flex-wrap">
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
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-slate-500">No players have joined or completed the quiz yet.</p>
          </div>
        )}

        {/* Room Info Summary */}
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

        {/* Leaderboard Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Final Leaderboard
            </h3>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Rank</th>
                  <th className="px-6 py-3 font-medium">Player</th>
                  <th className="px-6 py-3 font-medium text-right">Score</th>
                  <th className="px-6 py-3 font-medium text-right">Accuracy</th>
                  <th className="px-6 py-3 font-medium text-right">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {players.length > 0 ? (
                  players.map((player, index) => (
                    <tr key={player.id || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        {index === 0 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">1</span>
                        ) : index === 1 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700">2</span>
                        ) : index === 2 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-800">3</span>
                        ) : (
                          <span className="text-slate-500 font-medium">{index + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{player.name}</td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-600">{player.score ?? 0}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{player.accuracy ?? 0}%</td>
                      <td className="px-6 py-4 text-right text-slate-600">{player.avgTime ?? 0}s</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No players have joined this room yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 pb-8">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <Home className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <Button onClick={() => router.push(`/rooms/${room.code}`)}>
            View Room Details
          </Button>
        </div>
      </main>
    </div>
  );
}