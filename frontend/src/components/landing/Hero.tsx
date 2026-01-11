'use client';

import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onScrollToSearch: () => void;
}

export function Hero({ onScrollToSearch }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 hero-gradient-bg" />
      
      {/* Mesh overlay for texture */}
      <div className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 mb-8 animate-fade-in-up">
          <Sparkles className="text-primary-500" size={16} />
          <span className="text-sm font-medium text-navy-700">AI-Powered Intelligence Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-navy-900 mb-6 leading-tight animate-fade-in-up animation-delay-100">
          Company Research,{' '}
          <span className="gradient-text">Reimagined</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-navy-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
          Get comprehensive due diligence reports on any company in minutes. 
          Our AI analyzes multiple sources to deliver actionable investment insights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
          <button
            onClick={onScrollToSearch}
            className="btn-glow px-8 py-4 rounded-full text-white font-semibold text-lg flex items-center gap-3 min-w-[220px] justify-center"
          >
            Start Your Research
            <ArrowRight size={20} />
          </button>
          <button className="btn-outline-glow px-8 py-4 rounded-full text-navy-900 font-semibold text-lg min-w-[220px]">
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
          <div className="text-center">
            <div className="text-4xl font-bold text-navy-900">10+</div>
            <div className="text-sm text-navy-500 mt-1">Report Sections</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-navy-900">50+</div>
            <div className="text-sm text-navy-500 mt-1">Data Sources</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-navy-900">&lt;5min</div>
            <div className="text-sm text-navy-500 mt-1">Report Time</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-navy-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-navy-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
