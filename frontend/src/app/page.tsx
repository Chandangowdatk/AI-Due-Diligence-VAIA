'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search';
import { api } from '@/lib/api';
import { Building2, FileSearch, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (companyName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.startResearch({ company_name: companyName });
      router.push(`/report/${response.research_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start research');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <FileSearch className="text-blue-600" size={28} />
          <h1 className="text-xl font-semibold text-gray-900">Due Diligence Platform</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Company Research
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Get comprehensive due diligence reports on any company in minutes.
            Our AI analyzes multiple sources to deliver actionable insights.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Coverage</h3>
            <p className="text-sm text-gray-600">
              10 detailed sections covering financials, leadership, market position, and more.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="text-green-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Results</h3>
            <p className="text-sm text-gray-600">
              Get detailed reports in minutes, not days. Watch progress in real-time.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verified Sources</h3>
            <p className="text-sm text-gray-600">
              All information is sourced and cited. SEC filings prioritized for public companies.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          Due Diligence Platform - AI-powered research assistant
        </div>
      </footer>
    </main>
  );
}
