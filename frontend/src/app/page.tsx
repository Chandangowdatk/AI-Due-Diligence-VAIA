'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, Zap, Globe, Shield, ArrowRight, FileText, Brain, BarChart3 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Navbar, Footer } from '@/components/layout';
import { BackgroundOrbs } from '@/components/ui';

export default function HomePage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen relative font-sans text-neutral-900 dark:text-white selection:bg-brand-orange selection:text-white">
      <BackgroundOrbs isDark={isDark} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        
        <main className="flex-grow">
          <div className="flex flex-col gap-32 pb-32">
            {/* Hero Section */}
            <section className="relative px-6 pt-20 lg:pt-32 flex flex-col items-center text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-brand-orange font-medium mb-8 animate-fade-in-up">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Intelligence Platform</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-500 dark:from-white dark:via-white dark:to-neutral-500 animate-fade-in-up animation-delay-100">
                Company Research,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-peach">Reimagined</span>
              </h1>

              <p className="text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mb-12 leading-relaxed animate-fade-in-up animation-delay-200">
                Get comprehensive due diligence reports on any company in minutes. 
                Our AI analyzes thousands of sources to deliver actionable investment insights.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
                <button
                  onClick={() => router.push('/research')}
                  className="bg-brand-orange text-white px-8 py-4 rounded-full font-medium hover:bg-red-600 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/25"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-full font-medium border border-neutral-300 dark:border-white/20 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                >
                  Learn More
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-neutral-500 dark:text-neutral-400 animate-fade-in-up animation-delay-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>10+ Report Sections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Cited Sources</span>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="px-6 max-w-7xl mx-auto w-full">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-white">Everything You Need</h2>
                <p className="text-neutral-600 dark:text-neutral-400">Institutional-grade research with the speed of AI.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard 
                  icon={<Zap className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />}
                  title="Instant Analysis"
                  description="Generate comprehensive 10-section reports in under 5 minutes."
                />
                <FeatureCard 
                  icon={<Globe className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
                  title="Global Coverage"
                  description="Access data on public and private companies across all markets."
                />
                <FeatureCard 
                  icon={<Shield className="w-6 h-6 text-green-500 dark:text-green-400" />}
                  title="Verified Sources"
                  description="All insights are cited from SEC filings, annual reports, and trusted news."
                />
                <FeatureCard 
                  icon={<FileText className="w-6 h-6 text-purple-500 dark:text-purple-400" />}
                  title="Document Analysis"
                  description="Upload pitch decks, memos, and financials for deeper insights."
                />
                <FeatureCard 
                  icon={<Brain className="w-6 h-6 text-pink-500 dark:text-pink-400" />}
                  title="AI-Powered"
                  description="Advanced language models extract and synthesize key information."
                />
                <FeatureCard 
                  icon={<BarChart3 className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />}
                  title="Visual Insights"
                  description="Interactive charts for financials, market share, and ownership."
                />
              </div>
            </section>

            {/* How It Works */}
            <section className="px-6 max-w-7xl mx-auto w-full">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-white">How It Works</h2>
                <p className="text-neutral-600 dark:text-neutral-400">Three simple steps to comprehensive due diligence.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StepCard 
                  number="1"
                  title="Enter Company"
                  description="Type the name of any company you want to research."
                />
                <StepCard 
                  number="2"
                  title="Upload Documents"
                  description="Optionally add pitch decks, memos, or financials for deeper analysis."
                />
                <StepCard 
                  number="3"
                  title="Get Report"
                  description="Receive a comprehensive 10-section due diligence report in minutes."
                />
              </div>
            </section>
            
            {/* CTA Section */}
            <section id="how-it-works" className="px-6 max-w-7xl mx-auto w-full text-center">
              <div className="glass-panel p-12 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-purple-900/10 dark:from-brand-orange/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 relative z-10 text-neutral-900 dark:text-white">
                  Ready to get started?
                </h2>
                <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 relative z-10">
                  Join innovative teams using AI for due diligence.
                </p>
                <button 
                  onClick={() => router.push('/research')}
                  className="relative z-10 bg-brand-orange text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-600 hover:scale-105 transition-all shadow-lg shadow-brand-orange/25 flex items-center gap-2 mx-auto"
                >
                  <span>Start Your Research</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-500 pointer-events-none text-neutral-900 dark:text-white">
        {icon}
      </div>
      <div className="bg-neutral-100 dark:bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-neutral-200 dark:group-hover:bg-white/15 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl font-bold text-brand-orange">{number}</span>
      </div>
      <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}
