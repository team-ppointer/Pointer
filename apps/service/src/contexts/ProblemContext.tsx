'use client';
import { createContext, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useGetChildData } from '@apis';

export interface ProblemContextType {
  childProblemLength: number;
  mainProblemImageUrl: string;
  onPrev: () => void;
  onNext: () => void;
}

export const ProblemContext = createContext<ProblemContextType | null>(null);

export const ProblemProvider = ({ children }: { children: React.ReactNode }) => {
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();
  const router = useRouter();
  const [step, setStep] = useState<number>(0);

  // api
  const { data } = useGetChildData(publishId, problemId);
  const childData = data?.data;
  const { mainProblemImageUrl = '', childProblemIds = [] } = childData ?? {};

  const baseUrl = `/problem/solve/${publishId}/${problemId}`;

  const onPrev = () => {
    if (step === 0) {
      router.push(baseUrl);
    } else if (step > 0) {
      router.push(`${baseUrl}/child-problem/${childProblemIds[step - 1]}`);
      setStep(step - 1);
    }
  };

  const onNext = () => {
    if (step === childProblemIds.length - 1) {
      router.push(`${baseUrl}/main-problem`);
    } else if (step < childProblemIds.length - 1) {
      router.push(`${baseUrl}/child-problem/${childProblemIds[step + 1]}`);
      setStep(step + 1);
    }
  };

  const contextValue: ProblemContextType = {
    childProblemLength: childProblemIds.length,
    mainProblemImageUrl: mainProblemImageUrl,
    onPrev,
    onNext,
  };

  return <ProblemContext.Provider value={contextValue}>{children}</ProblemContext.Provider>;
};
