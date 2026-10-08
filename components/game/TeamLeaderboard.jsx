'use client';

import { cn } from '@/lib/utils';
import { Trophy, Medal, Award } from 'lucide-react';

const RANK_ICONS = [Trophy, Medal, Award];

const COLOR_DOT = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

export function TeamLeaderboard({
  entries = [],
  myTeamId,
  compact,
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No team scores yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.slice(0, compact ? 5 : 10).map((entry, idx) => {
        const Icon = RANK_ICONS[idx];
        const isMine = entry.teamId === myTeamId;

        return (
          <div
            key={entry.teamId}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 transition-all',
              isMine
                ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                : 'border-slate-200 bg-white',
              idx === 0 &&
                'border-amber-300 bg-gradient-to-r from-amber-50 to-white'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                idx === 0 && 'bg-amber-400 text-white',
                idx === 1 && 'bg-slate-300 text-slate-700',
                idx === 2 && 'bg-amber-600/70 text-white',
                idx > 2 && 'bg-slate-100 text-slate-600'
              )}
            >
              {Icon ? <Icon className="h-4 w-4" /> : entry.rank}
            </div>

            <span
              className={cn(
                'h-3 w-3 shrink-0 rounded-full',
                COLOR_DOT[entry.color] || 'bg-slate-400'
              )}
            />

            <span className="flex-1 truncate font-medium text-slate-800">
              {entry.teamName}
              {isMine && (
                <span className="ml-2 text-xs font-semibold text-indigo-600">
                  (Your team)
                </span>
              )}
            </span>

            <span className="font-bold tabular-nums text-slate-900">
              {(entry.score ?? 0).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}