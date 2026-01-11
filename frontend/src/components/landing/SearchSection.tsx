'use client';

import { useState, FormEvent, forwardRef } from 'react';
import { Search, Loader2, ArrowRight, Building2 } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (companyName: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const SearchSection = forwardRef<HTMLElement, SearchSectionProps>(
  function SearchSection({ onSearch, isLoading, error }, ref) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed && !isLoading) {
        onSearch(trimmed);
      }
    };

    const exampleCompanies = ['Reliance Industries', 'Tesla', 'OpenAI', 'Stripe'];

    return (
      <section ref={ref} id="search" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="section-label flex items-center justify-center gap-2 mb-4">
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
              Start Your Research
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
              Enter a Company Name
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              Our AI will analyze multiple sources and generate a comprehensive 
              due diligence report in minutes.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-2 transition-shadow hover:shadow-2xl focus-within:shadow-2xl focus-within:border-primary-300">
              <div className="flex items-center">
                <div className="pl-4">
                  <Building2 className="text-navy-400" size={24} />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter company name..."
                  className="flex-1 px-4 py-4 text-lg text-navy-900 placeholder-navy-400 bg-transparent focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="btn-glow px-8 py-4 rounded-xl text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      Research
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
                {error}
              </div>
            )}
          </form>

          {/* Example Companies */}
          <div className="mt-8 text-center">
            <span className="text-sm text-navy-400 mr-3">Try:</span>
            {exampleCompanies.map((company, index) => (
              <button
                key={company}
                onClick={() => setQuery(company)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium mx-2 hover:underline"
                disabled={isLoading}
              >
                {company}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }
);
