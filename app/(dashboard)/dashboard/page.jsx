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
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();

  const user = useUserStore((s) => s.user);
  const clearAuth = useUserStore((s) => s.clearAuth);

  const [roomCode, setRoomCode] = useState('');
  const [recentRooms, setRecentRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  const isHost = user?.role === 'HOST' || user?.role === 'ADMIN';
  const isPlayer = user?.role === 'PLAYER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  useEffect(() => {
    if (!isHost) {
      setLoadingRooms(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await roomApi.list();
        if (!cancelled) setRecentRooms(data.rooms || []);
      } catch {
        if (!cancelled) setRecentRooms([]);
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isHost]);

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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
            🧠 AptiQuiz
          </h1>

          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={cn(
                'hidden items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex',
                isAdmin && 'bg-red-100 text-red-700',
                user.role === 'HOST' && 'bg-amber-100 text-amber-700',
                isPlayer && 'bg-indigo-100 text-indigo-700'
              )}
            >
              {isAdmin && <ShieldCheck className="h-3 w-3" />}
              {user.role === 'HOST' && <ShieldCheck className="h-3 w-3" />}
              {isPlayer && <GraduationCap className="h-3 w-3" />}
              {user.role}
            </span>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">
                {user.college?.name || user.collegeId}
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
              {user.name?.slice(0, 2).toUpperCase()}
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Welcome back, {user.name?.split(' ')[0]} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isHost
              ? 'Create a room and manage your quizzes.'
              : 'Enter a room code to join a quiz.'}
          </p>
        </div>

        {/* ============================================
            PLAYER ONLY — Join Room (left) + Rules (right)
        ============================================ */}
        {isPlayer && (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* LEFT: Join Room */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <LogIn className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
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
                  className="text-center font-mono text-lg tracking-[0.3em]"
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
                Ask your teacher for the 6-character room code.
              </p>
            </div>

            {/* RIGHT: Rules / How it works */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
              <h3 className="mb-3 text-sm font-semibold text-indigo-700 sm:text-base">
                How it works
              </h3>
              <ol className="ml-4 list-decimal space-y-1.5 text-sm text-slate-600">
                <li>Your teacher will share a 6-character room code.</li>
                <li>
                  Enter the code and click <strong>Join Room</strong>.
                </li>
                <li>
                  Wait in the lobby until your teacher starts the quiz.
                </li>
                <li>
                  Answer questions <strong>as fast as you can</strong> — speed
                  matters for points.
                </li>
                <li>See your score on the live leaderboard.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ============================================
            HOST — Host Tools (full width)
        ============================================ */}
        {isHost && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                Host Tools
              </h3>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
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
        )}

        {/* ============================================
            HOST — Recent Rooms
        ============================================ */}
        {isHost && (
          <div className="mt-6 sm:mt-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">
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
                      >
                        {copiedCode === r.code ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                        r.status === 'ENDED'
                          ? 'bg-slate-100 text-slate-600'
                          : r.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      )}
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
        )}
      </main>
    </div>
  );
}