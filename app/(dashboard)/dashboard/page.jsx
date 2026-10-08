'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { authApi, roomApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardSkeleton } from '@/components/ui/Skeletons';
import {
  Plus,
  LogIn,
  BarChart3,
  BookOpen,
  LogOut,
  Clock,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const router = useRouter();

  const user = useUserStore((s) => s.user);
  const clearAuth = useUserStore((s) => s.clearAuth);

  const [roomCode, setRoomCode] = useState('');
  const [recentRooms, setRecentRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  // ---------- Redirect if not logged in ----------
  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  // ---------- Fetch recent rooms hosted by this user ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await roomApi.list();
        if (!cancelled) setRecentRooms(data.rooms || []);
      } catch {
        // Endpoint may not exist yet — silently ignore
        if (!cancelled) setRecentRooms([]);
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Handlers ----------
  function handleJoin(e) {
    e.preventDefault();
    if (roomCode.length === 6) {
      router.push(`/game/${roomCode.toUpperCase()}`);
    }
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      router.push('/login');
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({ title: 'Room code copied', duration: 1500 });
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  }

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">🧠 AptiQuiz</h1>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">
                {user.college?.name || user.collegeId}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
              {user.name?.slice(0, 2).toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back, {user.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-slate-500">
            Join a room or host your own.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ---------- Join Room ---------- */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <LogIn className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Join a Room
              </h3>
            </div>

            <form onSubmit={handleJoin} className="space-y-3">
              <Input
                value={roomCode}
                onChange={(e) =>
                  setRoomCode(e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="Enter 6-char code"
                className="text-center font-mono text-lg tracking-widest"
                maxLength={6}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={roomCode.length !== 6}
              >
                Join Room
              </Button>
            </form>

            <p className="mt-3 text-center text-xs text-slate-400">
              Ask your host for the 6-character room code.
            </p>
          </div>

          {/* ---------- Quick Actions ---------- */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Quick Actions
              </h3>
            </div>

            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push('/host/rooms/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Room
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push('/questions')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Question Bank
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push('/analytics')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* ---------- Recent Rooms ---------- */}
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent Rooms
          </h3>

          {loadingRooms ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : recentRooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
              No recent rooms yet. Create one to get started.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentRooms.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-indigo-700">
                      {r.code}
                    </span>
                    <button
                      onClick={() => copyCode(r.code)}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="Copy code"
                    >
                      {copiedCode === r.code ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {r.playerCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={
                      'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' +
                      (r.status === 'ENDED'
                        ? 'bg-slate-100 text-slate-600'
                        : r.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700')
                    }
                  >
                    {r.status}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() =>
                      r.status === 'ENDED'
                        ? router.push(`/results/${r.id}`)
                        : router.push(`/game/${r.code}`)
                    }
                  >
                    {r.status === 'ENDED' ? 'View Results' : 'Open'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}