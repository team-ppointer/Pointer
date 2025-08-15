'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { createContext } from 'react';
import PulseLoader from 'react-spinners/PulseLoader';

import { useGetProblemById } from '@apis';
import { components } from '@schema';

type ProblemInfoResp = components['schemas']['ProblemWithStudyInfoResp'];

export interface ReportContextType extends ProblemInfoResp {
  publishId: number;
  problemId: number;
  type?: string | null;
  childNumber?: number;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

export const ReportContext = createContext<ReportContextType | null>(null);

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();
  const type = searchParams.get('type');
  const childNumber = searchParams.get('childNumber');

  const { data, isLoading, error } = useGetProblemById({
    publishId: +publishId,
    problemId: +problemId,
  });
  if (error) {
    return null;
  }
  if (isLoading) {
    return <PulseLoader color='#617AF9' aria-label='Loading Spinner' />;
  }

  if (!data) {
    return <div>No data found</div>;
  }

  const contextValue: ReportContextType = {
    ...data,
    publishId: +publishId,
    problemId: +problemId,
    type: type || null,
    childNumber: childNumber ? +childNumber : undefined,
    isLoading,
    error,
  };

  return <ReportContext.Provider value={contextValue}>{children}</ReportContext.Provider>;
};
