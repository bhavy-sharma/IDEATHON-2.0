import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
// app/layout.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AptiQuiz — Real-Time Multiplayer Aptitude Platform',
  description:
    'High-performance, server-authoritative multiplayer quiz platform for colleges.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}