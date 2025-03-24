'use client';

import { getCommentary } from '@apis';
import { components } from '@schema';
import { useParams } from 'next/navigation';
import { createContext } from 'react';

type CommentaryGetResponse = components['schemas']['CommentaryGetResponse'];

export const ReportContext = createContext<CommentaryGetResponse | null>(null);

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const { publishId, problemId } = useParams();
  const { data: reportData } = getCommentary({
    publishId: publishId as string,
    problemId: problemId as string,
  });

  return <ReportContext.Provider value={reportData?.data ?? {}}>{children}</ReportContext.Provider>;
};
