'use client';

import Link from 'next/link';
import { FileSearch, Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <FileSearch className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold">DueDiligence</span>
            </Link>
            <p className="text-navy-400 text-sm mb-6">
              AI-powered company research platform for investment professionals.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-navy-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-navy-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-navy-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-navy-300">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-navy-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="text-navy-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="#pricing" className="text-navy-400 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-navy-300">
              Company
            </h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-navy-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="text-navy-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-navy-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-navy-300">
              Legal
            </h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-navy-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-navy-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-navy-400 text-sm">
            © {new Date().getFullYear()} DueDiligence. All rights reserved.
          </p>
          <p className="text-navy-500 text-sm">
            Powered by AI • Built for Investment Professionals
          </p>
        </div>
      </div>
    </footer>
  );
}
