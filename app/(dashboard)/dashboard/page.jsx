// app/(dashboard)/dashboard/page.jsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Plus,
  Users,
  Copy,
  Check,
  FileQuestion,
  Trash2,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const router = useRouter();

  // ── State: Rooms ─────────────────────────────────────────────────
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // ── State: Question Sets ─────────────────────────────────────────
  const [questionSets, setQuestionSets] = useState([]);
  const [setsLoading, setSetsLoading] = useState(true);
  const [showCreateSet, setShowCreateSet] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDesc, setNewSetDesc] = useState('');
  const [savingSet, setSavingSet] = useState(false);

  // ── Load rooms ───────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load rooms');
      const data = await res.json();
      setRooms(data.rooms ?? []);
    } catch {
      toast({ title: 'Failed to load rooms', variant: 'destructive' });
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  // ── Load question sets ───────────────────────────────────────────
  const fetchQuestionSets = useCallback(async () => {
    try {
      const res = await fetch('/api/questions/sets?page=1&limit=50', {
        cache: 'no-store',
      });
      const data = await res.json();
      const sets = data.sets ?? data.data ?? [];
      setQuestionSets(sets);
      if (sets[0] && !selectedSetId) setSelectedSetId(sets[0].id);
    } catch {
      toast({ title: 'Failed to load question sets', variant: 'destructive' });
    } finally {
      setSetsLoading(false);
    }
  }, [selectedSetId]);

  useEffect(() => {
    fetchRooms();
    fetchQuestionSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Create room ──────────────────────────────────────────────────
  async function handleCreateRoom() {
    if (!selectedSetId) {
      toast({ title: 'Select a question set first', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionSetId: selectedSetId,
          settings: { mode: 'MULTI', timeLimit: 20, allowSpectators: true },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create room');

      toast({ title: 'Room created', description: `Code: ${data.room.code}` });
      await fetchRooms(); // ✅ refresh list
    } catch (err) {
      toast({
        title: 'Create failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  }

  // ── Create question set ──────────────────────────────────────────
  async function handleCreateSet(e) {
    e.preventDefault();
    if (!newSetName.trim()) return;
    setSavingSet(true);
    try {
      const res = await fetch('/api/question-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSetName.trim(),
          description: newSetDesc.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create set');

      toast({ title: 'Question set created' });
      setNewSetName('');
      setNewSetDesc('');
      setShowCreateSet(false);
      await fetchQuestionSets();
    } catch (err) {
      toast({
        title: 'Create failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSavingSet(false);
    }
  }

  // ── Delete question set ──────────────────────────────────────────
  async function handleDeleteSet(id) {
    if (!confirm('Delete this set and all its questions?')) return;
    try {
      const res = await fetch(`/api/question-sets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setQuestionSets((s) => s.filter((x) => x.id !== id));
      toast({ title: 'Question set deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-2xl font-bold">Host Dashboard</h1>

        {/* ════════════════ QUESTION SETS ════════════════ */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileQuestion className="h-5 w-5" />
              Your Question Sets
            </h2>
            <Button
              size="sm"
              onClick={() => setShowCreateSet((v) => !v)}
            >
              <Plus className="mr-2 h-4 w-4" /> New Set
            </Button>
          </div>

          {/* Create set form */}
          {showCreateSet && (
            <form
              onSubmit={handleCreateSet}
              className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <input
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="Set name (e.g. JavaScript Basics)"
                className="w-full rounded border px-3 py-2 text-sm"
                autoFocus
              />
              <textarea
                value={newSetDesc}
                onChange={(e) => setNewSetDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded border px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={savingSet || !newSetName.trim()}>
                  {savingSet ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateSet(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Sets list */}
          {setsLoading ? (
            <div className="flex justify-center py-6 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading sets…
            </div>
          ) : questionSets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No question sets yet. Create your first one.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {questionSets.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{s.name}</p>
                    {s.description && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {s.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      {s._count?.questions ?? s.questions?.length ?? 0} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/questions/${s.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSet(s.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ════════════════ CREATE ROOM ════════════════ */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold">Start a Room</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSetId}
              onChange={(e) => setSelectedSetId(e.target.value)}
              className="flex-1 min-w-[200px] rounded border px-3 py-2 text-sm"
            >
              <option value="">— Select question set —</option>
              {questionSets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Button onClick={handleCreateRoom} disabled={creating || !selectedSetId}>
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create Room
            </Button>
          </div>
        </section>

        {/* ════════════════ RECENT ROOMS ════════════════ */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent Rooms</h2>

          {roomsLoading ? (
            <div className="flex justify-center py-6 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading rooms…
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No rooms yet. Create your first one above.
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold tracking-widest text-slate-900">
                        {room.code}
                      </span>
                      <button
                        onClick={() => copyCode(room.code)}
                        className="text-slate-400 hover:text-slate-700"
                        title="Copy code"
                      >
                        {copiedCode === room.code ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{room.questionSet?.name ?? 'No set'}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room._count?.participants ?? 0}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5">
                        {room.status}
                      </span>
                      <span>
                        {new Date(room.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/room/${room.id}`)}
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}