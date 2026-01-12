'use client';

import Link from 'next/link';
import { FileSearch, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  showNav?: boolean;
}

export function Navbar({ isDark, toggleTheme, showNav = true }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-lg dark:shadow-2xl dark:shadow-black/20">
          <Link 
            href="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-gradient-to-br from-brand-orange to-red-600 p-2 rounded-xl group-hover:shadow-[0_0_15px_rgba(255,87,34,0.5)] transition-shadow duration-300">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-white dark:to-neutral-400">
              DueDiligence
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {showNav && (
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <a href="#features" className="hover:text-brand-orange dark:hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-brand-orange dark:hover:text-white transition-colors">How it Works</a>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition-all"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
