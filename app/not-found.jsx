'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
            <Search className="h-10 w-10 text-indigo-600" />
          </div>
        </div>

        <h1 className="mb-2 text-6xl font-bold text-slate-900">404</h1>
        <h2 className="mb-3 text-xl font-semibold text-slate-800">
          Page not found
        </h2>
        <p className="mb-8 text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}