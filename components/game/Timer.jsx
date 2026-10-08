'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Timer({ endTime, totalTime, onExpire }) {
  const [remaining, setRemaining] = useState(totalTime);

  useEffect(() => {
    if (!endTime) {
      setRemaining(totalTime);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) onExpire?.();
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [endTime, totalTime, onExpire]);

  const percentage = totalTime > 0 ? (remaining / totalTime) * 100 : 0;
  const isCritical = remaining <= 3;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-200 ease-linear',
            isCritical
              ? 'bg-red-500'
              : percentage > 50
              ? 'bg-emerald-500'
              : 'bg-amber-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={cn(
          'min-w-[3rem] text-right text-2xl font-bold tabular-nums',
          isCritical ? 'animate-pulse text-red-600' : 'text-slate-700'
        )}
      >
        {remaining}s
      </span>
    </div>
  );
}