'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { ResearchStatusResponse } from '@/types';

const POLL_INTERVAL = 3000; // 3 seconds

interface UseResearchStatusResult {
  status: ResearchStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useResearchStatus(researchId: string | null): UseResearchStatusResult {
  const [status, setStatus] = useState<ResearchStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!researchId) return;

    try {
      setIsLoading(true);
      const data = await api.getResearchStatus(researchId);
      setStatus(data);
      setError(null);

      // Stop polling if research is complete or failed
      if (data.status === 'complete' || data.status === 'failed') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, [researchId]);

  useEffect(() => {
    if (!researchId) {
      setStatus(null);
      return;
    }

    // Initial fetch
    fetchStatus();

    // Start polling
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [researchId, fetchStatus]);

  return { status, isLoading, error, refetch: fetchStatus };
}
