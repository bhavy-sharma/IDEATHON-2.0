'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useUserStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.login({ email, password });
      setAuth(data.user, data.accessToken);
      toast({ title: `Welcome back, ${data.user.name.split(' ')[0]}!` });
      router.push('/dashboard');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* ============================================
          HEADER
      ============================================ */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900 sm:text-2xl">
              🧠 AptiQuiz
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              New here?
            </span>
            <Link href="/register">
              <Button variant="outline" size="sm">
                Create Account
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ============================================
          MAIN — Login Form
      ============================================ */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-6 text-center sm:mb-8">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-indigo-600 hover:underline"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Test credentials hint */}
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center text-xs text-slate-600">
            <strong className="text-indigo-700">Demo accounts:</strong>{' '}
            host@test.com or player@test.com · password123
          </div>
        </div>
      </main>

    </div>
  );
}