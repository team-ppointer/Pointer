'use client';

import { useParams } from 'next/navigation';
import { createContext } from 'react';

import { useGetProblemById } from '@apis';
import { components } from '@schema';

type ProblemInfoResp = components['schemas']['ProblemWithStudyInfoResp'];

export const ReportContext = createContext<ProblemInfoResp | null>(null);

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();
  const { data } = useGetProblemById(+publishId, +problemId);
  console.log('ReportProvider data:', data);
  return (
    <ReportContext.Provider value={data ? { ...data } : null}>{children}</ReportContext.Provider>
  );
};
