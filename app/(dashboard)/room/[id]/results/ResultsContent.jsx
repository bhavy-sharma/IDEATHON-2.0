// app/(dashboard)/room/[id]/results/ResultsContent.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/components/game/Leaderboard';
import { TeamLeaderboard } from '@/components/game/TeamLeaderboard';
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Users,
  Target,
  Clock,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResultsContent({ id }) {   // ✅ prop
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('leaderboard');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api.get(`/rooms/${id}/results`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading results…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-slate-500">Results not available yet.</p>
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { room, leaderboard, teamLeaderboard, stats, questions } = data;
  const isTeamMode = room?.settings?.mode === 'TEAM';
  const myEntry = leaderboard?.find((e) => e.userId === user?.id);
  const myRank = myEntry?.rank;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Game Results
              </h1>
              <p className="text-xs text-slate-500">
                Room{' '}
                <span className="font-mono font-semibold text-indigo-600">
                  {room?.code}
                </span>{' '}
                · {new Date(room?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Personal banner */}
        {myEntry && (
          <div
            className={cn(
              'rounded-2xl border-2 p-6 text-center',
              myRank === 1
                ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white'
                : myRank <= 3
                ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-white'
                : 'border-slate-200 bg-white'
            )}
          >
            <div className="mb-2 flex items-center justify-center gap-2">
              {myRank === 1 && <Trophy className="h-6 w-6 text-amber-500" />}
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your Result
              </p>
            </div>
            <p className="text-5xl font-bold text-slate-900">#{myRank}</p>
            <p className="mt-2 text-lg font-semibold text-slate-700">
              {myEntry.score.toLocaleString()} points
            </p>
            <p className="text-sm text-slate-500">
              out of {leaderboard.length} player
              {leaderboard.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Stats row */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={Users}
              label="Players"
              value={stats.totalPlayers}
              color="indigo"
            />
            <StatCard
              icon={Target}
              label="Avg Accuracy"
              value={`${Math.round((stats.averageAccuracy || 0) * 100)}%`}
              color="emerald"
            />
            <StatCard
              icon={Clock}
              label="Avg Time"
              value={`${(stats.averageResponseTime || 0).toFixed(1)}s`}
              color="amber"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setTab('leaderboard')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === 'leaderboard'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {isTeamMode ? 'Team Standings' : 'Final Leaderboard'}
          </button>
          <button
            onClick={() => setTab('questions')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === 'questions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            Question Breakdown
          </button>
        </div>

        {/* Leaderboard tab */}
        {tab === 'leaderboard' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {isTeamMode && teamLeaderboard?.length ? (
              <TeamLeaderboard entries={teamLeaderboard} />
            ) : (
              <Leaderboard entries={leaderboard || []} />
            )}
          </div>
        )}

        {/* Questions tab */}
        {tab === 'questions' && (
          <div className="space-y-3">
            {(questions || []).map((q, i) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    Q{i + 1}
                  </span>
                  <span className="text-xs text-slate-400">
                    {q.topic} · {q.difficulty}
                  </span>
                </div>
                <p className="mb-3 font-medium text-slate-800">{q.text}</p>

                {/* Accuracy bar */}
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        q.accuracy >= 0.7
                          ? 'bg-emerald-500'
                          : q.accuracy >= 0.4
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${q.accuracy * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-slate-600">
                    {Math.round(q.accuracy * 100)}% correct
                  </span>
                </div>

                {/* Correct option */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  <span className="font-semibold">Correct answer: </span>
                  {q.options?.find((o) => o.id === q.correctOptionId)?.text ||
                    '—'}
                </div>
              </div>
            ))}

            {(!questions || questions.length === 0) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                No question data available.
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push('/host/rooms/new')}
          >
            Host Another Game
          </Button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    indigo: 'from-indigo-50 to-white border-indigo-200 text-indigo-700',
    emerald: 'from-emerald-50 to-white border-emerald-200 text-emerald-700',
    amber: 'from-amber-50 to-white border-amber-200 text-amber-700',
  };
  return (
    <div
      className={cn(
        'rounded-2xl border bg-gradient-to-br p-4 shadow-sm',
        colors[color]
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 opacity-70" />
        <p className="text-xs font-medium uppercase tracking-wide opacity-70">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}