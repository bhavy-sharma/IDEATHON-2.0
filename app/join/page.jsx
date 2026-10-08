// app/join/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function JoinPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Join failed');
      router.push(`/game/${data.room.code}`);   // ✅ go to real-time room
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={handleJoin}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-center text-xl font-bold">Join a Room</h1>
        <p className="text-center text-sm text-slate-500">
          Enter the code shared by your host.
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={8}
          autoFocus
          className="w-full rounded-lg border px-4 py-3 text-center font-mono text-2xl tracking-widest"
        />
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading || code.length < 4}
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Join
        </button>
      </form>
    </div>
  );
}