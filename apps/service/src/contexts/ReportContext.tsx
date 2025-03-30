'use client';

import { useParams } from 'next/navigation';
import { createContext } from 'react';

import { getCommentary } from '@apis';
import { components } from '@schema';

type CommentaryGetResponse = components['schemas']['CommentaryGetResponse'];

export const ReportContext = createContext<CommentaryGetResponse | null>(null);

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();
  const { data: reportData } = getCommentary({
    publishId,
    problemId,
  });

  return <ReportContext.Provider value={reportData?.data ?? {}}>{children}</ReportContext.Provider>;
};
