'use client';

// 👇 1. Suspense ko import karo
import { useCallback, useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { questionApi, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { QuestionEditor } from '@/components/questions/QuestionEditor';
import { toast } from '@/components/ui/use-toast';

export default function EditQuestionSetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/questions/sets/${id}`);
      setSet(data.set);
    } catch (err) {
      toast({
        title: 'Failed to load set',
        description: err?.response?.data?.message || 'Not found.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(questionId) {
    if (!confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${questionId}`);
      setSet((s) => ({
        ...s,
        questions: s.questions.filter((q) => q.id !== questionId),
      }));
      toast({ title: 'Question deleted' });
    } catch (err) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (!set) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Set not found.
      </div>
    );
  }

  // 👇 2. Pure return JSX ko Suspense mein wrap kar do
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
      </div>
    }>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {set.name}
                </h1>
                <p className="text-xs text-slate-500">
                  {set.questions?.length || 0} questions
                </p>
              </div>
            </div>
            <Button onClick={() => setEditing({ id: null })}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">
          {set.questions?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="mb-4 text-sm text-slate-500">
                No questions yet. Add your first one.
              </p>
              <Button onClick={() => setEditing({ id: null })}>
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {set.questions?.map((q, i) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          Q{i + 1}
                        </span>
                        <span className="text-xs text-slate-400">
                          {q.topic} · {q.difficulty} · {q.timeLimit}s
                        </span>
                      </div>
                      <p className="font-medium text-slate-800">{q.text}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(q)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(q.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {q.options?.map((o) => (
                      <div
                        key={o.id}
                        className={
                          'rounded-lg border px-3 py-1.5 text-sm ' +
                          (o.isCorrect
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-600')
                        }
                      >
                        {o.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {editing && (
          <QuestionEditor
            setId={id}
            initial={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </div>
    </Suspense>
  );
}