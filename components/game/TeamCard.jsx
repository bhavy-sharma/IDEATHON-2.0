'use client';

import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

const COLOR_MAP = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
    avatar: 'bg-red-500',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    avatar: 'bg-blue-500',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
    avatar: 'bg-emerald-500',
  },
  yellow: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-700',
    avatar: 'bg-amber-500',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-700',
    avatar: 'bg-purple-500',
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-300',
    text: 'text-pink-700',
    avatar: 'bg-pink-500',
  },
};

export function TeamCard({
  team,
  players = [],
  isMyTeam = false,
  showScore = false,
  rank = null,
  compact = false,
}) {
  const colors = COLOR_MAP[team.color] || COLOR_MAP.blue;
  const members = players.filter((p) => p.teamId === team.id);

  return (
    <div
      className={cn(
        'rounded-2xl border-2 bg-gradient-to-br shadow-sm transition-all',
        colors.bg,
        isMyTeam ? cn(colors.border, 'ring-2 ring-offset-1') : 'border-slate-200',
        compact ? 'p-3' : 'p-3 sm:p-4'
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white sm:text-sm',
              colors.avatar
            )}
          >
            {team.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className={cn('truncate text-sm font-semibold sm:text-base', colors.text)}>
              {team.name}
              {isMyTeam && (
                <span className="ml-1 text-[10px] font-medium opacity-70 sm:text-xs">
                  (You)
                </span>
              )}
            </h3>
            {!compact && (
              <p className="text-[10px] text-slate-500 sm:text-xs">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {rank !== null && rank <= 3 && (
          <Crown
            className={cn(
              'h-4 w-4 shrink-0 sm:h-5 sm:w-5',
              rank === 1 && 'text-amber-500',
              rank === 2 && 'text-slate-400',
              rank === 3 && 'text-amber-700'
            )}
          />
        )}
      </div>

      {!compact && (
        <div className="mb-2 flex flex-wrap gap-1 sm:mb-3 sm:gap-1.5">
          {members.length === 0 ? (
            <span className="text-[10px] text-slate-400 sm:text-xs">
              No members yet
            </span>
          ) : (
            members.map((m) => (
              <span
                key={m.id}
                className="max-w-full truncate rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 shadow-sm sm:text-xs"
              >
                {m.name}
              </span>
            ))
          )}
        </div>
      )}

      {showScore && (
        <div className="flex items-baseline justify-between border-t border-white/60 pt-2 sm:pt-3">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
            Team Score
          </span>
          <span className={cn('text-xl font-bold tabular-nums sm:text-2xl', colors.text)}>
            {(team.score ?? 0).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}