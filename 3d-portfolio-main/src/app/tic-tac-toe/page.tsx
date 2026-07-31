import React from 'react';
import TicTacToe from '@/components/tic-tac-toe/TicTacToe';
import AnimatedBackground from '@/components/animated-background';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'X-O Arena | Real-Time Multiplayer',
  description: 'Play Real-Time Multiplayer Tic-Tac-Toe with friends.',
};

export default function TicTacToePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-black pt-16 sm:pt-24 pb-4 sm:pb-12 px-2 sm:px-6 lg:px-8 flex flex-col">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-2 sm:mb-4">
            X-O <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Arena</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-lg font-medium px-4">
            Step into the arena, noobs. Time to get absolutely clapped in real-time. 💀
          </p>
        </div>
        
        <div className="flex-1">
          <TicTacToe />
        </div>
      </div>
    </main>
  );
}
