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

  const sorted = [...teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3">
        {sorted.map((team) => (
          <div
            key={team.id}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 transition-all sm:gap-2 sm:px-3 sm:py-2',
              team.id === myTeamId
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 bg-slate-50'
            )}
          >
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3',
                COLOR_MAP[team.color] || 'bg-slate-400'
              )}
            />
            <span className="whitespace-nowrap text-xs font-medium text-slate-700 sm:text-sm">
              {team.name}
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-900 sm:text-base">
              {(team.score ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}