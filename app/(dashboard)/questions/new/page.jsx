'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { questionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function NewQuestionSetPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const finalName = name.trim();
    
    if (!finalName) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    
    // 🔥 YEH PAYLOAD BANAO
    const payload = {
      name: finalName,
      description: description.trim(),
      questions: [],
    };

    // 🔥 FRONTEND CHECK: Browser ke Console (F12) mein yeh dekhna
    console.log("🚀 FRONTEND SENDING PAYLOAD:", payload);

    try {
      await questionApi.create(payload);
      toast({ title: 'Question set created' });
      router.push('/questions');
    } catch (err) {
      console.error("❌ BACKEND ERROR RESPONSE:", err.response?.data);
      toast({
        title: 'Failed to save',
        description: err?.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">
            New Question Set
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Set Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quantitative Aptitude — Week 1"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Short description for this set…"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!name.trim() || saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving…' : 'Save Set'}
          </Button>
        </div>
      </main>
    </div>
  );
}