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

export function TeamLeaderboard({ entries = [], myTeamId, compact }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500 sm:p-6 sm:text-sm">
        No team scores yet
      </div>
    );
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {entries.slice(0, compact ? 5 : 10).map((entry, idx) => {
        const Icon = RANK_ICONS[idx];
        const isMine = entry.teamId === myTeamId;

        return (
          <div
            key={entry.teamId}
            className={cn(
              'flex items-center gap-2 rounded-lg border p-2 transition-all sm:gap-3 sm:p-3',
              isMine
                ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                : 'border-slate-200 bg-white',
              idx === 0 &&
                'border-amber-300 bg-gradient-to-r from-amber-50 to-white'
            )}
          >
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm',
                idx === 0 && 'bg-amber-400 text-white',
                idx === 1 && 'bg-slate-300 text-slate-700',
                idx === 2 && 'bg-amber-600/70 text-white',
                idx > 2 && 'bg-slate-100 text-slate-600'
              )}
            >
              {Icon ? <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : entry.rank}
            </div>

            <span
              className={cn(
                'h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3',
                COLOR_DOT[entry.color] || 'bg-slate-400'
              )}
            />

            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
              {entry.teamName}
              {isMine && (
                <span className="ml-1 text-[10px] font-semibold text-indigo-600 sm:ml-2 sm:text-xs">
                  (You)
                </span>
              )}
            </span>

            <span className="text-sm font-bold tabular-nums text-slate-900 sm:text-base">
              {(entry.score ?? 0).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}