'use client';

import { cn } from '@/lib/utils';
import { Trophy, Medal, Award } from 'lucide-react';

const RANK_ICONS = [Trophy, Medal, Award];

export function Leaderboard({ entries = [], highlightPlayerId, compact }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        No scores yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.slice(0, compact ? 5 : 10).map((entry, idx) => {
        const Icon = RANK_ICONS[idx];
        const isHighlighted = entry.playerId === highlightPlayerId;

        return (
          <div
            key={entry.playerId}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 transition-all',
              isHighlighted
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

            <span className="flex-1 truncate font-medium text-slate-800">
              {entry.playerName}
              {isHighlighted && (
                <span className="ml-2 text-xs font-semibold text-indigo-600">
                  (You)
                </span>
              )}
            </span>

            <span className="font-bold tabular-nums text-slate-900">
              {entry.score.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}