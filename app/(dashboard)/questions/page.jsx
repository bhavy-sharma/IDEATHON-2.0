'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { questionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { QuestionsSkeleton } from '@/components/ui/Skeletons';

export default function QuestionsPage() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await questionApi.getSets(1, 50);
        if (!cancelled) setSets(data.sets || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h1 className="text-lg font-semibold text-slate-900">
              Question Bank
            </h1>
          </div>
          <Link href="/questions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Set
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {loading ? (
          <QuestionsSkeleton />
        ) : sets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="mb-2 text-lg font-semibold text-slate-700">
              No question sets yet
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              Create your first set to start hosting rooms.
            </p>
            <Link href="/questions/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Question Set
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sets.map((s) => (
              <Link
                key={s.id}
                href={`/questions/${s.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-1 font-semibold text-slate-900">
                  {s.name}
                </h3>
                <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                  {s.description || 'No description'}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{s.questions?.length || 0} questions</span>
                  <span>·</span>
                  <span>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}