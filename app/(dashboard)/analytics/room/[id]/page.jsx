'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function RoomAnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/analytics/room/${id}`);
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
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading analytics…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        No data available.
      </div>
    );
  }

  const chartData = data.questionStats.map((q, i) => ({
    name: `Q${i + 1}`,
    accuracy: Math.round(q.accuracy * 100),
    avgTime: Math.round(q.avgResponseTimeMs / 100) / 10,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">
            Room Analytics
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Players"
            value={data.totalPlayers}
            color="indigo"
          />
          <SummaryCard
            label="Avg Score"
            value={Math.round(data.averageScore)}
            color="emerald"
          />
          <SummaryCard
            label="Questions"
            value={data.questionStats.length}
            color="amber"
          />
        </div>

        {/* Accuracy chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">
            Accuracy per Question (%)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.accuracy >= 70
                          ? '#10b981'
                          : entry.accuracy >= 40
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3 text-right">Attempts</th>
                <th className="px-4 py-3 text-right">Correct</th>
                <th className="px-4 py-3 text-right">Accuracy</th>
                <th className="px-4 py-3 text-right">Avg Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.questionStats.map((q, i) => (
                <tr key={q.questionId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    Q{i + 1}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    <span className="line-clamp-1">{q.questionText}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                    {q.totalAttempts}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                    {q.correctAttempts}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    <span
                      className={
                        q.accuracy >= 0.7
                          ? 'text-emerald-600'
                          : q.accuracy >= 0.4
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }
                    >
                      {Math.round(q.accuracy * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                    {(q.avgResponseTimeMs / 1000).toFixed(1)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    indigo: 'from-indigo-50 to-white border-indigo-200 text-indigo-700',
    emerald: 'from-emerald-50 to-white border-emerald-200 text-emerald-700',
    amber: 'from-amber-50 to-white border-amber-200 text-amber-700',
  };
  return (
    <div
      className={
        'rounded-2xl border bg-gradient-to-br p-5 shadow-sm ' +
        colors[color]
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}