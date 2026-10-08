'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useReconnect } from '@/hooks/useReconnect';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { OptionCard } from '@/components/game/OptionCard';
import { Timer } from '@/components/game/Timer';
import { Leaderboard } from '@/components/game/Leaderboard';
import { PlayerList } from '@/components/game/PlayerList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = (params?.code || '').toUpperCase();
  const isSpectator = searchParams.get('spectate') === '1';

  const user = useUserStore((s) => s.user);

  const {
    isConnected,
    joinRoom,
    toggleReady,
    startGame,
    submitAnswer,
  } = useSocket();

  useReconnect();

  const {
    room,
    players,
    status,
    currentQuestion,
    questionIndex,
    totalQuestions,
    endTime,
    selectedOptionId,
    hasAnswered,
    correctOptionId,
    leaderboard,
    selectOption,
    markAnswered,
    reset,
  } = useGameStore();

  const [guestName, setGuestName] = useState('');
  const [joined, setJoined] = useState(false);

  // Reset the game store when leaving the room
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Join the room once connected
  useEffect(() => {
    if (!isConnected || joined) return;

    if (isSpectator) {
      joinRoom(code, 'Spectator');
      setJoined(true);
      return;
    }

    const name = user?.name || guestName;
    if (!name) return;

    joinRoom(code, name);
    setJoined(true);
  }, [isConnected, joined, isSpectator, user, guestName, code, joinRoom]);

  // Keyboard shortcuts A / B / C / D
  useEffect(() => {
    if (isSpectator) return;
    if (status !== 'ACTIVE' || hasAnswered || !currentQuestion) return;

    const handler = (e) => {
      const idx = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
      if (idx >= 0 && currentQuestion.options[idx]) {
        const optionId = currentQuestion.options[idx].id;
        selectOption(optionId);
        submitAnswer({ questionId: currentQuestion.id, optionId });
        markAnswered();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    isSpectator,
    status,
    hasAnswered,
    currentQuestion,
    selectOption,
    submitAnswer,
    markAnswered,
  ]);

  // ---------- Guest name gate (players only) ----------
  if (!isSpectator && !user && !guestName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Join Room {code}
          </h2>
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your display name"
            className="mb-3"
          />
          <Button
            className="w-full"
            disabled={!guestName || !isConnected}
            onClick={() => setJoined(false)}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // ---------- Connecting ----------
  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-slate-600">Connecting to room…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-lg font-bold text-slate-900 hover:text-indigo-600"
            >
              🧠 AptiQuiz
            </button>
            <span className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-xs font-semibold text-indigo-700">
              {code}
            </span>
            {isSpectator && (
              <span className="rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                SPECTATOR
              </span>
            )}
          </div>
          <span className="text-sm text-slate-500">
            {status === 'LOBBY' && 'Lobby'}
            {status === 'ACTIVE' &&
              `Question ${questionIndex + 1}/${totalQuestions}`}
            {status === 'REVEAL' && 'Answer Revealed'}
            {status === 'ENDED' && 'Game Ended'}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* ---------- LOBBY ---------- */}
        {status === 'LOBBY' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Waiting for players…
                </h2>
                <span className="text-sm text-slate-500">
                  {players.length} joined
                </span>
              </div>
              <PlayerList players={players} />
            </div>

            {!isSpectator && (
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="lg" onClick={toggleReady}>
                  Toggle Ready
                </Button>
                <Button size="lg" onClick={startGame}>
                  Start Game
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ---------- ACTIVE / REVEAL ---------- */}
        {(status === 'ACTIVE' || status === 'REVEAL') && currentQuestion && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Question area */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <Timer
                    endTime={endTime}
                    totalTime={currentQuestion.timeLimit}
                  />
                </div>

                <h2 className="mb-6 text-xl font-semibold leading-relaxed text-slate-900">
                  {currentQuestion.text}
                </h2>

                {currentQuestion.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question illustration"
                    className="mb-6 max-h-64 rounded-lg border border-slate-200"
                  />
                )}

                <div className="space-y-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOptionId === opt.id;
                    const isCorrect =
                      correctOptionId === null
                        ? null
                        : opt.id === correctOptionId;

                    return (
                      <OptionCard
                        key={opt.id}
                        option={opt}
                        index={idx}
                        isSelected={isSelected}
                        isCorrect={isCorrect}
                        disabled={
                          isSpectator || hasAnswered || status === 'REVEAL'
                        }
                        onSelect={(optionId) => {
                          if (isSpectator) return;
                          selectOption(optionId);
                          submitAnswer({
                            questionId: currentQuestion.id,
                            optionId,
                          });
                          markAnswered();
                        }}
                      />
                    );
                  })}
                </div>

                {!isSpectator && hasAnswered && status === 'ACTIVE' && (
                  <p className="mt-4 text-center text-sm text-slate-500">
                    Answer submitted. Waiting for others…
                  </p>
                )}

                {isSpectator && status === 'ACTIVE' && (
                  <p className="mt-4 text-center text-sm text-purple-600">
                    Spectating — you cannot submit answers.
                  </p>
                )}
              </div>
            </div>

            {/* Leaderboard sidebar */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Leaderboard
                </h3>
                <Leaderboard entries={leaderboard} compact />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Players ({players.length})
                </h3>
                <div className="space-y-1.5">
                  {players.slice(0, 8).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate text-slate-700">
                        {p.name}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-500">
                        {p.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ---------- ENDED ---------- */}
        {status === 'ENDED' && (
          <div className="mx-auto max-w-xl space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="mb-2 text-3xl font-bold text-slate-900">
                🎉 Game Over
              </h2>
              <p className="mb-6 text-slate-500">Final standings</p>
              <Leaderboard entries={leaderboard} />
            </div>

            <Button
              className="w-full"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* ---------- Fallback (no room / unknown status) ---------- */}
        {!room && status === 'LOBBY' && players.length === 0 && (
          <div className="mt-6 text-center text-sm text-slate-400">
            Waiting for room state…
          </div>
        )}
      </main>
    </div>
  );
}