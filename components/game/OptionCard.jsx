'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { OPTION_LABELS } from '@/lib/constants';

export function OptionCard({
  option,
  index,
  isSelected,
  isCorrect,
  disabled,
  onSelect,
}) {
  const revealed = isCorrect !== null;
  const showAsCorrect = revealed && isCorrect === true;
  const showAsWrong = revealed && isSelected && isCorrect === false;

  return (
    <button
      onClick={() => !disabled && onSelect(option.id)}
      disabled={disabled}
      className={cn(
        'group relative w-full rounded-xl border-2 p-4 text-left transition-all duration-200',
        'flex items-center gap-4',
        !revealed &&
          !isSelected &&
          'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50',
        !revealed &&
          isSelected &&
          'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200',
        showAsCorrect && 'border-emerald-500 bg-emerald-50',
        showAsWrong && 'border-red-500 bg-red-50',
        revealed &&
          !showAsCorrect &&
          !showAsWrong &&
          'border-slate-200 bg-slate-50 opacity-60',
        disabled && !revealed && 'cursor-not-allowed opacity-70'
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
          !revealed &&
            !isSelected &&
            'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700',
          !revealed && isSelected && 'bg-indigo-600 text-white',
          showAsCorrect && 'bg-emerald-500 text-white',
          showAsWrong && 'bg-red-500 text-white',
          revealed &&
            !showAsCorrect &&
            !showAsWrong &&
            'bg-slate-200 text-slate-500'
        )}
      >
        {OPTION_LABELS[index]}
      </span>

      <span
        className={cn(
          'flex-1 text-base font-medium',
          showAsCorrect && 'text-emerald-900',
          showAsWrong && 'text-red-900',
          !revealed && 'text-slate-800'
        )}
      >
        {option.text}
      </span>

      {showAsCorrect && (
        <Check className="h-6 w-6 shrink-0 text-emerald-600" />
      )}
      {showAsWrong && <X className="h-6 w-6 shrink-0 text-red-600" />}
    </button>
  );
}