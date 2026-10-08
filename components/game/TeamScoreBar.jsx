'use client';

import { cn } from '@/lib/utils';

const COLOR_MAP = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

export function TeamScoreBar({ teams, myTeamId }) {
  if (!teams?.length) return null;

  // Sort by score descending for display order
  const sorted = [...teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3 overflow-x-auto">
        {sorted.map((team) => (
          <div
            key={team.id}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl border-2 px-3 py-2 transition-all',
              team.id === myTeamId
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 bg-slate-50'
            )}
          >
            <span
              className={cn(
                'h-3 w-3 rounded-full',
                COLOR_MAP[team.color] || 'bg-slate-400'
              )}
            />
            <span className="text-sm font-medium text-slate-700">
              {team.name}
            </span>
            <span className="text-base font-bold tabular-nums text-slate-900">
              {(team.score ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}