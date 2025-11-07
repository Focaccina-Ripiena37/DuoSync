"use client";
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { AuthProvider } from '@/components/auth/AuthProvider';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 pb-20 md:px-6 md:py-8 md:pb-8">
          {children}
        </main>
        <footer className="py-4 text-center text-xs text-muted-foreground">
          <p>❤️ DuoSync</p>
        </footer>
        {/* Bottom navigation only on mobile */}
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
