'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Shield,
  Trophy,
  Users,
  Wifi,
  BarChart3,
  BookOpen,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Server-Authoritative',
    desc: 'The server controls the clock, validates every answer, and calculates scores — clients can’t tamper.',
  },
  {
    icon: Shield,
    title: 'Fair Play',
    desc: 'Option shuffling per player and a 500ms network grace period keeps competition fair.',
  },
  {
    icon: Trophy,
    title: 'Live Leaderboard',
    desc: 'Redis-backed O(1) updates push ranks to every screen in real time.',
  },
  {
    icon: Users,
    title: '50+ Players / Room',
    desc: 'Built on Socket.IO with Redis Adapter for horizontal scaling.',
  },
  {
    icon: Wifi,
    title: 'Auto Reconnect',
    desc: 'Lose connection? Rejoin with your score intact via secure reconnect tokens.',
  },
  {
    icon: BarChart3,
    title: 'Faculty Analytics',
    desc: 'Per-question accuracy and response-time insights for every room.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Create a Room',
    desc: 'Hosts pick a question set, set the timer, and get a 6-character code.',
  },
  {
    number: '02',
    title: 'Students Join',
    desc: 'Students enter the code from any device — no app install needed.',
  },
  {
    number: '03',
    title: 'Play Live',
    desc: 'Questions stream in sync. Fastest correct answers earn more points.',
  },
  {
    number: '04',
    title: 'See Results',
    desc: 'Instant leaderboards and post-game analytics per question.',
  },
];

export default function HomePage() {
  const user = useUserStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && !!user;

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          HEADER
      ============================================ */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900 sm:text-2xl">
              🧠 AptiQuiz
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm">
                  Go to Dashboard
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ============================================
          HERO
      ============================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
            <Sparkles className="h-3 w-3" />
            Real-Time Multiplayer Aptitude Platform
          </span>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Quiz at the speed of{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              thought.
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base text-slate-600 sm:text-lg">
            A high-performance, server-authoritative quiz engine for colleges.
            Up to 50+ concurrent players per room with live leaderboards,
            fair scoring, and rock-solid anti-cheat.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Go to Dashboard
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="px-8">
                    Start Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8">
                    I have an account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 sm:text-sm">
            {[
              'No install required',
              'Works on any device',
              'Free for colleges',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
      ============================================ */}
      <section className="border-t border-slate-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
              From setup to results in under a minute.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <span className="mb-4 inline-block font-mono text-3xl font-bold text-indigo-200">
                  {step.number}
                </span>
                <h3 className="mb-2 font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES
      ============================================ */}
      <section className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Built for real classrooms
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
              Every design decision optimizes for fairness, speed, and scale.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-600">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          ROLES
      ============================================ */}
      <section className="border-t border-slate-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Made for hosts and students
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
              Two roles, one seamless experience.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hosts */}
            <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    For Teachers / Hosts
                  </h3>
                  <p className="text-xs text-amber-700">
                    Full control over quizzes
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-slate-700">
                {[
                  'Build reusable question sets',
                  'Schedule timed rooms with custom durations',
                  'Assign teams for team battles',
                  'Watch live progress and leaderboards',
                  'Get per-question accuracy analytics',
                  'Export results for gradebooks',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="mt-6 inline-block">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Create a Room
                </Button>
              </Link>
            </div>

            {/* Students */}
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    For Students
                  </h3>
                  <p className="text-xs text-indigo-700">
                    Jump in with just a code
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-slate-700">
                {[
                  'Join any room with a 6-character code',
                  'Compete in solo or team battles',
                  'Track your streak and history',
                  'See your live rank during the quiz',
                  'Reconnect without losing your score',
                  'Review missed questions after the game',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="mt-6 inline-block">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Join a Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA
      ============================================ */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
            Ready to run your first quiz?
          </h2>
          <p className="mb-8 text-sm text-indigo-100 sm:text-base">
            Free for colleges. No credit card. Get started in under a minute.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white px-8 text-indigo-700 hover:bg-indigo-50"
                >
                  Go to Dashboard
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white px-8 text-indigo-700 hover:bg-indigo-50"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-transparent px-8 text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
      ============================================ */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">
                🧠 AptiQuiz
              </span>
            </div>

            <p className="text-xs text-slate-500">
  © 2026 AptiQuiz. All rights reserved.
</p>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href="/login" className="hover:text-indigo-600">
                Login
              </Link>
              <span className="text-slate-300">·</span>
              <Link href="/register" className="hover:text-indigo-600">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}