'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Header,
  Hero,
  SearchSection,
  Features,
  HowItWorks,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchSectionRef = useRef<HTMLElement>(null);

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

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen">
      <Header />
      <Hero onScrollToSearch={scrollToSearch} />
      <SearchSection
        ref={searchSectionRef}
        onSearch={handleSearch}
        isLoading={isLoading}
        error={error}
      />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
