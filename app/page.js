'use client';

import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Shield,
  Trophy,
  Users,
  Wifi,
  BarChart3,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Server-Authoritative',
    desc: 'The server controls the clock, validates answers, and scores — clients can’t tamper.',
  },
  {
    icon: Shield,
    title: 'Fair Play',
    desc: 'Option shuffling per player + 500ms network grace period keeps competition fair.',
  },
  {
    icon: Trophy,
    title: 'Live Leaderboard',
    desc: 'Redis-backed O(1) updates push ranks to every screen in real time.',
  },
  {
    icon: Users,
    title: '50+ Players / Room',
    desc: 'Built on Socket.IO + Redis Adapter for horizontal scaling.',
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

export default function LandingPage() {
  const user = useUserStore((s) => s.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Nav */}
      <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">🧠 AptiQuiz</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <span className="mb-4 inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700">
          Real-Time Multiplayer Aptitude Platform
        </span>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Quiz at the speed of{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            thought.
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          A high-performance, server-authoritative quiz engine for colleges.
          Up to 50+ concurrent players per room with live leaderboards,
          fair scoring, and rock-solid anti-cheat.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
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
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-8 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
          Built for colleges · Powered by Next.js, Socket.IO & Redis
        </div>
      </footer>
    </div>
  );
}