'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const PALETTE = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];

export function TeamAssignmentPanel({ players, teams, onAssign, isHost }) {
  const [teamCount, setTeamCount] = useState(teams.length || 2);

  function autoBalance() {
    if (!isHost) return;
    if (players.length < 2) return;

    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const newTeams = [];
    for (let i = 0; i < teamCount; i++) {
      newTeams.push({
        id: `team_${i + 1}`,
        name: `Team ${i + 1}`,
        color: PALETTE[i % PALETTE.length],
        memberIds: [],
      });
    }

    shuffled.forEach((p, idx) => {
      newTeams[idx % teamCount].memberIds.push(p.id);
    });

    onAssign({ teams: newTeams });
  }

  if (!isHost) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
            Team Assignment
          </h3>
        </div>
        <p className="text-xs text-slate-500 sm:text-sm">
          Waiting for the host to assign teams…
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
          Team Assignment
        </h3>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Number of Teams
        </label>
        <div className="flex flex-wrap gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => setTeamCount(n)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-colors sm:h-10 sm:w-10',
                teamCount === n
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Button
        className="w-full"
        onClick={autoBalance}
        disabled={players.length < 2}
      >
        <Shuffle className="mr-2 h-4 w-4" />
        Auto-Balance Teams
      </Button>

      <p className="mt-3 text-xs text-slate-400">
        Players are distributed evenly at random.
      </p>
    </div>
  );
}