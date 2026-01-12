'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Zap, Globe, Shield, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Navbar, Footer } from '@/components/layout';
import { BackgroundOrbs } from '@/components/ui';

export default function HomePage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = ['Reliance Industries', 'Tesla Inc', 'OpenAI', 'Stripe'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.startResearch({ company_name: inputValue });
      router.push(`/report/${response.research_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start research');
      setIsLoading(false);
    }
  };

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

              {/* Search Interface */}
              <div className="w-full max-w-2xl relative z-20 animate-fade-in-up animation-delay-300">
                <form onSubmit={handleSubmit} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-red-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500" />
                  <div className="relative flex items-center bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-full p-2 pl-6 shadow-2xl transition-all group-hover:border-brand-orange/30 dark:group-hover:border-white/20">
                    <Search className="w-6 h-6 text-neutral-400 dark:text-neutral-500 mr-4" />
                    <input
                      type="text"
                      placeholder="Enter company name..."
                      className="flex-grow bg-transparent text-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none py-3"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isLoading}
                    />
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="bg-brand-orange text-white px-8 py-3 rounded-full font-medium hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{isLoading ? 'Starting...' : 'Research'}</span>
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </form>

                {error && (
                  <p className="mt-4 text-red-500 text-sm">{error}</p>
                )}

                <div className="mt-6 flex flex-wrap justify-center items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                  <span>Try:</span>
                  {suggestions.map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setInputValue(s)}
                      className="px-3 py-1 rounded-full border border-neutral-300 dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      {s}
                    </button>
                  ))}
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
              </div>
            </section>
            
            {/* CTA Section */}
            <section id="how-it-works" className="px-6 max-w-7xl mx-auto w-full text-center">
              <div className="glass-panel p-12 rounded-[2.5rem] relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-purple-900/10 dark:from-brand-orange/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 relative z-10 text-neutral-900 dark:text-white">Ready to build the future?</h2>
                <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 relative z-10">Join the innovative teams using AI for due diligence.</p>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="relative z-10 bg-neutral-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-200"
                >
                  Start Your Research
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
