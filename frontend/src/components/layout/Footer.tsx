'use client';

import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-white/10 bg-white dark:bg-[#020202] py-12 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <div className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">DueDiligence</div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">© 2026 DueDiligence AI. All rights reserved.</p>
        </div>
        
        <div className="flex gap-6">
          <a href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </a>
          <a href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>

        <div className="flex gap-8 text-sm text-neutral-500 dark:text-neutral-400">
          <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
