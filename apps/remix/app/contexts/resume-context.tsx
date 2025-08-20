'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import type { Resume } from '~/types/resume';

type ResumeContextType = {
  resumes: Resume[];
  isLoading: boolean;
  error: string | null;
  refreshResumes: () => Promise<void>;
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

type ResumeProviderProps = {
  children: ReactNode;
};

export function ResumeProvider({ children }: Readonly<ResumeProviderProps>) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Using a mock response for now since the API endpoint isn't ready
      // In a real app, this would be: const response = await fetch('/api/resumes');
      const mockResumes: Resume[] = [
        {
          id: '1',
          name: 'Senior Developer Resume.pdf',
          filePath: '/resumes/senior-dev.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Frontend Developer Resume.pdf',
          filePath: '/resumes/frontend-dev.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      setResumes(mockResumes);
      
      // Uncomment this when the API is ready:
      // const response = await fetch('/api/resumes');
      // if (!response.ok) {
      //   throw new Error('Failed to fetch resumes');
      // }
      // const data = await response.json();
      // setResumes(data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const contextValue = useMemo(() => ({
    resumes,
    isLoading,
    error,
    refreshResumes: fetchResumes,
  }), [resumes, isLoading, error, fetchResumes]);

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumes() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResumes must be used within a ResumeProvider');
  }
  return context;
}
