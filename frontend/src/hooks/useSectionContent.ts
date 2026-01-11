'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { SectionContentResponse, SectionId } from '@/types';

interface UseSectionContentResult {
  content: SectionContentResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSectionContent(
  researchId: string | null,
  sectionId: SectionId | null
): UseSectionContentResult {
  const [content, setContent] = useState<SectionContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!researchId || !sectionId) return;

    try {
      setIsLoading(true);
      const data = await api.getSectionContent(researchId, sectionId);
      setContent(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch section');
    } finally {
      setIsLoading(false);
    }
  }, [researchId, sectionId]);

  useEffect(() => {
    if (!researchId || !sectionId) {
      setContent(null);
      return;
    }

    fetchContent();
  }, [researchId, sectionId, fetchContent]);

  return { content, isLoading, error, refetch: fetchContent };
}
