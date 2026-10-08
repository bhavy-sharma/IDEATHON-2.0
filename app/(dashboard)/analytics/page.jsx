'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BarChart3, Loader2 } from 'lucide-react';

export default function AnalyticsHomePage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/rooms');
        setRooms(data.rooms || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <h1 className="text-lg font-semibold text-slate-900">
            Analytics
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading rooms…
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No rooms hosted yet.
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((r) => (
              <Link
                key={r.id}
                href={`/analytics/room/${r.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-indigo-700">
                    {r.code}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={
                    'rounded-full px-2.5 py-1 text-xs font-medium ' +
                    (r.status === 'ENDED'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-emerald-100 text-emerald-700')
                  }
                >
                  {r.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}