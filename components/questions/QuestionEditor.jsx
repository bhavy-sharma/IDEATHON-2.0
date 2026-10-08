'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const EMPTY_OPTION = () => ({ text: '', isCorrect: false });

export function QuestionEditor({ setId, initial, onClose, onSaved }) {
  const isNew = !initial?.id;

  const [text, setText] = useState(initial?.text || '');
  const [topic, setTopic] = useState(initial?.topic || 'General');
  const [difficulty, setDifficulty] = useState(initial?.difficulty || 'MEDIUM');
  const [timeLimit, setTimeLimit] = useState(initial?.timeLimit || 20);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '');
  const [options, setOptions] = useState(
    initial?.options?.length
      ? initial.options.map((o) => ({
          text: o.text,
          isCorrect: !!o.isCorrect,
        }))
      : [EMPTY_OPTION(), EMPTY_OPTION(), EMPTY_OPTION(), EMPTY_OPTION()]
  );
  const [saving, setSaving] = useState(false);

  function updateOption(i, patch) {
    setOptions((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o))
    );
  }

  function toggleCorrect(i) {
    setOptions((prev) =>
      prev.map((o, idx) => ({ ...o, isCorrect: idx === i }))
    );
  }

  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, EMPTY_OPTION()]);
  }

  function removeOption(i) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function validate() {
    if (!text.trim()) return 'Question text is required';
    if (options.some((o) => !o.text.trim()))
      return 'All options must have text';
    if (!options.some((o) => o.isCorrect))
      return 'Mark exactly one option as correct';
    return null;
  }

  async function handleSave() {
    const error = validate();
    if (error) {
      toast({ title: error, variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      text: text.trim(),
      topic,
      difficulty,
      timeLimit: Number(timeLimit) || 20,
      imageUrl: imageUrl || undefined,
      options: options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
      questionSetId: setId,
    };

    try {
      if (isNew) {
        await api.post('/questions', payload);
      } else {
        await api.put(`/questions/${initial.id}`, payload);
      }
      toast({ title: isNew ? 'Question added' : 'Question updated' });
      onSaved?.();
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err?.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {isNew ? 'Add Question' : 'Edit Question'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Question text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Topic
              </label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option>EASY</option>
                <option>MEDIUM</option>
                <option>HARD</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Time (s)
              </label>
              <Input
                type="number"
                min={5}
                max={120}
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Image URL (optional)
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Options
              </label>
              <Button variant="ghost" size="sm" onClick={addOption}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCorrect(i)}
                    title="Mark as correct"
                    className={
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ' +
                      (o.isCorrect
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 bg-white text-slate-400 hover:border-emerald-400')
                    }
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <Input
                    value={o.text}
                    onChange={(e) => updateOption(i, { text: e.target.value })}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(i)}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Click the letter badge to mark the correct answer.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}