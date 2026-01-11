'use client';

import Link from 'next/link';
import { FileSearch, ArrowRight } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-navy-800 transition-colors">
              <FileSearch className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-navy-900 tracking-tight">
              DueDiligence
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-navy-600 hover:text-navy-900 font-medium transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-navy-600 hover:text-navy-900 font-medium transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-navy-600 hover:text-navy-900 font-medium transition-colors">
              Pricing
            </Link>
          </div>

          {/* CTA Button */}
          <Link
            href="#search"
            className="btn-glow px-6 py-2.5 rounded-full text-white font-semibold flex items-center gap-2"
          >
            Start Research
            <ArrowRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
