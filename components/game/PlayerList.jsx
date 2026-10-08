'use client';

import { cn } from '@/lib/utils';
import { Check, Clock } from 'lucide-react';

export function PlayerList({ players = [], currentPlayerId }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {players.map((player) => {
        const isMe = player.id === currentPlayerId;
        return (
          <div
            key={player.id}
            className={cn(
              'flex items-center justify-between rounded-lg border p-3',
              isMe
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-slate-200 bg-white'
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                  isMe ? 'bg-indigo-500' : 'bg-slate-400'
                )}
              >
                {player.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="truncate font-medium text-slate-800">
                {player.name}
                {isMe && (
                  <span className="ml-1 text-xs text-indigo-600">(You)</span>
                )}
              </span>
            </div>

            {player.isReady ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check className="h-4 w-4" /> Ready
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                <Clock className="h-4 w-4" /> Waiting
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}