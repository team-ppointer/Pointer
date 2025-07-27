'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { createContext } from 'react';

import { useGetProblemById } from '@apis';
import { components } from '@schema';

type ProblemInfoResp = components['schemas']['ProblemWithStudyInfoResp'];

interface ReportContextType extends ProblemInfoResp {
  publishId: number;
  problemId: number;
  type?: string | null;
  childProblemId?: number;
  isLoading: boolean;
  error?: any;
}

export const ReportContext = createContext<ReportContextType | null>(null);

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();
  const type = searchParams.get('type');
  const childNumber = searchParams.get('childNumber');
  const { data, isLoading, error } = useGetProblemById(+publishId, +problemId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data found</div>;
  }

  const contextValue: ReportContextType = {
    ...data,
    publishId: +publishId,
    problemId: +problemId,
    type: type || null,
    childProblemId: childNumber ? +childNumber : undefined,
    isLoading,
    error,
  };

  return <ReportContext.Provider value={contextValue}>{children}</ReportContext.Provider>;
};
