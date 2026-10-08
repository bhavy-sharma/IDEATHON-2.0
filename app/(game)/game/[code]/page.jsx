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
import { TeamCard } from '@/components/game/TeamCard';
import { TeamLeaderboard } from '@/components/game/TeamLeaderboard';
import { TeamAssignmentPanel } from '@/components/game/TeamAssignmentPanel';
import { TeamScoreBar } from '@/components/game/TeamScoreBar';
import { ShareRoomPanel } from '@/components/game/ShareRoomPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { GameLobbySkeleton } from '@/components/ui/Skeletons';

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
    assignTeams,
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
    mode,
    teams,
    myTeamId,
    teamLeaderboard,
    selectOption,
    markAnswered,
    reset,
  } = useGameStore();

  const [guestName, setGuestName] = useState('');
  const [joined, setJoined] = useState(false);

  const isHost = user?.role === 'HOST' || user?.id === room?.hostId;
  const isTeamMode = mode === 'TEAM';

  // Derive whether current player is ready
  const myPlayer = players.find(
    (p) => p.userId === user?.id || p.name === user?.name
  );
  const myReady = myPlayer?.isReady || false;

  // Reset store when leaving
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Join room
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

  // Keyboard shortcuts
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

  // ---------- Guest name gate ----------
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

  // ---------- Connecting (skeleton) ----------
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <GameLobbySkeleton />
        </main>
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
            {isTeamMode && (
              <span className="rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                TEAM BATTLE
              </span>
            )}
            {isSpectator && (
              <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                SPECTATOR
              </span>
            )}
            {!isSpectator && !isHost && status === 'LOBBY' && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                PLAYER
              </span>
            )}
            {isHost && (
              <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                HOST
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

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* Team score bar (only during play) */}
        {isTeamMode && teams.length > 0 && status !== 'LOBBY' && (
          <TeamScoreBar teams={teams} myTeamId={myTeamId} />
        )}

        {/* ---------- LOBBY ---------- */}
        {status === 'LOBBY' && (
          <div className="space-y-6">
            {/* Team assignment panel */}
            {isTeamMode && (
              <TeamAssignmentPanel
                players={players}
                teams={teams}
                isHost={isHost}
                onAssign={({ teams: newTeams }) => assignTeams(newTeams)}
              />
            )}

            {/* Team cards grid */}
            {isTeamMode && teams.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    players={players}
                    isMyTeam={team.id === myTeamId}
                  />
                ))}
              </div>
            )}

            {/* Players list (solo mode) */}
            {!isTeamMode && (
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
            )}

            {/* Share panel — host only */}
            {!isSpectator && isHost && <ShareRoomPanel code={code} />}

            {/* Player: Toggle Ready */}
            {!isSpectator && !isHost && (
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant={myReady ? 'default' : 'outline'}
                  size="lg"
                  onClick={toggleReady}
                >
                  {myReady ? '✓ Ready' : 'Toggle Ready'}
                </Button>
                <p className="text-sm text-slate-500">
                  Waiting for the host to start the game…
                </p>
              </div>
            )}

            {/* Host: Start Game only */}
            {!isSpectator && isHost && (
              <div className="flex flex-col items-center gap-2">
                <Button
                  size="lg"
                  onClick={startGame}
                  disabled={
                    players.length < 1 || (isTeamMode && teams.length === 0)
                  }
                  className="px-12"
                >
                  Start Game
                </Button>
                <p className="text-xs text-slate-400">
                  {players.length} player{players.length !== 1 ? 's' : ''} in
                  lobby
                </p>
              </div>
            )}

            {isTeamMode && teams.length === 0 && isHost && (
              <p className="text-center text-sm text-amber-600">
                Assign teams before starting.
              </p>
            )}
          </div>
        )}

        {/* ---------- ACTIVE / REVEAL ---------- */}
        {(status === 'ACTIVE' || status === 'REVEAL') && currentQuestion && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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

            <aside className="space-y-4">
              {isTeamMode ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Team Standings
                  </h3>
                  <TeamLeaderboard
                    entries={teamLeaderboard}
                    myTeamId={myTeamId}
                    compact
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Leaderboard
                  </h3>
                  <Leaderboard entries={leaderboard} compact />
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {isTeamMode ? 'Your Team' : 'Players'}
                </h3>

                {isTeamMode ? (
                  (() => {
                    const myTeam = teams.find((t) => t.id === myTeamId);
                    if (!myTeam) return null;
                    return (
                      <TeamCard
                        team={myTeam}
                        players={players}
                        isMyTeam
                        showScore
                        compact
                      />
                    );
                  })()
                ) : (
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
                )}
              </div>
            </aside>
          </div>
        )}

        {/* ---------- ENDED ---------- */}
        {status === 'ENDED' && (
          <div className="mx-auto max-w-2xl space-y-6">
            {isTeamMode && teamLeaderboard.length > 0 && (
              <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-8 text-center shadow-sm">
                <p className="mb-1 text-sm font-medium uppercase tracking-wide text-amber-700">
                  🏆 Winning Team
                </p>
                <h2 className="text-3xl font-bold text-slate-900">
                  {teamLeaderboard[0].teamName}
                </h2>
                <p className="mt-2 text-lg font-semibold text-amber-700 tabular-nums">
                  {teamLeaderboard[0].score.toLocaleString()} pts
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="mb-2 text-3xl font-bold text-slate-900">
                🎉 Game Over
              </h2>
              <p className="mb-6 text-slate-500">
                {isTeamMode ? 'Final team standings' : 'Final standings'}
              </p>

              {isTeamMode ? (
                <TeamLeaderboard
                  entries={teamLeaderboard}
                  myTeamId={myTeamId}
                />
              ) : (
                <Leaderboard entries={leaderboard} />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push(`/results/${room?.id}`)}
              >
                View Full Results
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}