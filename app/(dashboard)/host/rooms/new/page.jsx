'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { questionApi, roomApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function CreateRoomPage() {
  const router = useRouter();

  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [mode, setMode] = useState('SOLO');
  const [loadingSets, setLoadingSets] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await questionApi.getSets(1, 50);
        if (!cancelled) {
          setSets(data.sets || []);
          if (data.sets?.length) setSelectedSetId(data.sets[0].id);
        }
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

  async function handleCreate() {
    if (!selectedSetId) return;
    setCreating(true);
    try {
      const { data } = await roomApi.create({
        questionSetId: selectedSetId,
        settings: { timeLimit, scoringMode: 'STANDARD', mode },
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">
            Create New Room
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6">
          {/* Question Set */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Question Set
            </label>
            {loadingSets ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading sets…
              </div>
            ) : sets.length === 0 ? (
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                You have no question sets yet.{' '}
                <button
                  className="font-semibold underline"
                  onClick={() => router.push('/questions')}
                >
                  Create one first
                </button>
                .
              </div>
            ) : (
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
            )}
          </div>

          {/* Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              Room Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Time per question (seconds)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={timeLimit}
                  onChange={(e) =>
                    setTimeLimit(Number(e.target.value) || 20)
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Mode
                </label>
                <div className="flex gap-2">
                  {['SOLO', 'TEAM'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={
                        'flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ' +
                        (mode === m
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')
                      }
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleCreate}
            disabled={!selectedSetId || creating}
          >
            {creating ? 'Creating…' : 'Create Room'}
          </Button>
        </div>
      </main>
    </div>
  );
}