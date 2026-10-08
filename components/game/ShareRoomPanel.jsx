'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ShareRoomPanel({ code, roomId }) {
  const [copiedField, setCopiedField] = useState(null);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/game/${code}`
      : `/game/${code}`;

  const spectatorUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/game/${code}?spectate=1`
      : `/game/${code}?spectate=1`;

  async function copy(text, field) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // silently fail
    }
  }

  async function nativeShare() {
    if (typeof navigator === 'undefined' || !navigator.share) {
      copy(joinUrl, 'share');
      return;
    }
    try {
      await navigator.share({
        title: 'Join my AptiQuiz room',
        text: `Room code: ${code}`,
        url: joinUrl,
      });
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Share2 className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-900">Invite Players</h3>
      </div>

      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
            <QRCodeSVG value={joinUrl} size={140} level="M" />
          </div>
          <p className="text-xs text-slate-500">Scan to join</p>
        </div>

        {/* Code + Links */}
        <div className="space-y-4">
          {/* Room code */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Room Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] text-indigo-700">
                {code}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copy(code, 'code')}
                title="Copy code"
              >
                {copiedField === 'code' ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Join link */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Player Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {joinUrl}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copy(joinUrl, 'join')}
                title="Copy player link"
              >
                {copiedField === 'join' ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Spectator link */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Spectator Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {spectatorUrl}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copy(spectatorUrl, 'spectate')}
                title="Copy spectator link"
              >
                {copiedField === 'spectate' ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Native share */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button className="w-full" onClick={nativeShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share via…
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}