'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { questionApi, roomApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Loader2,
  Users,
  Clock,
  Trophy,
  Info,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function CreateRoomPage() {
  const router = useRouter();

  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [mode, setMode] = useState('SOLO');
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [loadingSets, setLoadingSets] = useState(true);
  const [creating, setCreating] = useState(false);

  // ---------- Load question sets ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await questionApi.getSets(1, 50);
        if (cancelled) return;
        const list = data.sets || [];
        setSets(list);
        if (list.length) setSelectedSetId(list[0].id);
      } catch (err) {
        toast({
          title: 'Failed to load question sets',
          description: err?.response?.data?.message || 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setLoadingSets(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Create room ----------
  async function handleCreate() {
    if (!selectedSetId) return;
    setCreating(true);

    try {
      const { data } = await roomApi.create({
        questionSetId: selectedSetId,
        settings: {
          timeLimit: Number(timeLimit) || 20,
          scoringMode: 'STANDARD',
          mode,
          allowSpectators,
        },
      });

      toast({
        title: 'Room created',
        description: `Code: ${data.room.code}`,
      });

      router.push(`/game/${data.room.code}`);
    } catch (err) {
      toast({
        title: 'Could not create room',
        description: err?.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
      setCreating(false);
    }
  }

  const selectedSet = sets.find((s) => s.id === selectedSetId);
  const questionCount = selectedSet?.questions?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Create New Room
            </h1>
            <p className="text-xs text-slate-500">
              Set up your quiz and invite players
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6">
          {/* ---------- Question Set ---------- */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-700">
                Question Set
              </h2>
            </div>

            {loadingSets ? (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading sets…
              </div>
            ) : sets.length === 0 ? (
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                You don&apos;t have any question sets yet.{' '}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => router.push('/questions/new')}
                >
                  Create one first
                </button>
                .
              </div>
            ) : (
              <>
                <select
                  value={selectedSetId}
                  onChange={(e) => setSelectedSetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {sets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.questions?.length || 0} questions
                    </option>
                  ))}
                </select>

                {selectedSet && (
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">
                      {questionCount} questions
                    </span>
                    {selectedSet.description && (
                      <span className="line-clamp-1">
                        {selectedSet.description}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          {/* ---------- Room Settings ---------- */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-700">
                Room Settings
              </h2>
            </div>

            <div className="space-y-5">
              {/* Time limit */}
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Time per question
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={timeLimit}
                    onChange={(e) =>
                      setTimeLimit(Number(e.target.value) || 20)
                    }
                    className="max-w-[120px]"
                  />
                  <span className="text-sm text-slate-500">seconds</span>
                </div>
                <div className="mt-2 flex gap-2">
                  {[10, 15, 20, 30, 45, 60].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeLimit(t)}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                        timeLimit === t
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode */}
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Game Mode
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      value: 'SOLO',
                      label: 'Solo',
                      desc: 'Every player competes individually',
                    },
                    {
                      value: 'TEAM',
                      label: 'Team Battle',
                      desc: 'Players battle in teams',
                    },
                  ].map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMode(m.value)}
                      className={cn(
                        'rounded-xl border-2 p-3 text-left transition-colors',
                        mode === m.value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Users
                          className={cn(
                            'h-4 w-4',
                            mode === m.value
                              ? 'text-indigo-600'
                              : 'text-slate-400'
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            mode === m.value
                              ? 'text-indigo-700'
                              : 'text-slate-700'
                          )}
                        >
                          {m.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {m.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {mode === 'TEAM' && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-purple-50 p-3 text-xs text-purple-700">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p>
                      In team mode, you&apos;ll assign players into teams once
                      they join the lobby. Each team&apos;s score is the sum of
                      its members&apos; scores.
                    </p>
                  </div>
                )}
              </div>

              {/* Spectators */}
              <div>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={allowSpectators}
                    onChange={(e) => setAllowSpectators(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Allow spectators
                    </p>
                    <p className="text-xs text-slate-500">
                      Non-players can watch the game in read-only mode
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* ---------- Summary ---------- */}
          {selectedSet && (
            <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Summary
              </h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>
                  <span className="text-slate-500">Set:</span>{' '}
                  <strong>{selectedSet.name}</strong>
                </li>
                <li>
                  <span className="text-slate-500">Questions:</span>{' '}
                  <strong>{questionCount}</strong>
                </li>
                <li>
                  <span className="text-slate-500">Time per question:</span>{' '}
                  <strong>{timeLimit}s</strong>
                </li>
                <li>
                  <span className="text-slate-500">Mode:</span>{' '}
                  <strong>{mode}</strong>
                </li>
                <li>
                  <span className="text-slate-500">Spectators:</span>{' '}
                  <strong>{allowSpectators ? 'Allowed' : 'Disabled'}</strong>
                </li>
                <li>
                  <span className="text-slate-500">Estimated duration:</span>{' '}
                  <strong>
                    ~{Math.ceil((questionCount * (timeLimit + 7)) / 60)} min
                  </strong>
                </li>
              </ul>
            </section>
          )}

          {/* ---------- Submit ---------- */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleCreate}
            disabled={!selectedSetId || creating || questionCount === 0}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              'Create Room'
            )}
          </Button>

          {questionCount === 0 && selectedSet && (
            <p className="text-center text-xs text-amber-600">
              This question set has no questions. Add some first.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}