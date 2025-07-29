'use client';
import { createContext, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useGetProblemById } from '@apis';

export interface ProblemContextType {
  childProblemLength: number;
  onPrev: () => void;
  onNext: () => void;
}

export const ProblemContext = createContext<ProblemContextType | null>(null);

export const ProblemProvider = ({ children }: { children: React.ReactNode }) => {
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();
  const router = useRouter();
  const [step, setStep] = useState<number>(0);

  // api
  const { data } = useGetProblemById(+publishId, +problemId);
  if (!data) {
    return null;
  }
  const childProblems = data?.childProblems ?? [];

  const baseUrl = `/problem/solve/${publishId}/${problemId}`;

  const onPrev = () => {
    if (step === 0) {
      router.push(baseUrl);
    } else if (step > 0) {
      router.push(`${baseUrl}/child-problem/${childProblems[step - 1].id}`);
      setStep(step - 1);
    }
  };

  const onNext = () => {
    if (step === childProblems.length - 1) {
      router.push(baseUrl);
    } else if (step < childProblems.length - 1) {
      router.push(`${baseUrl}/child-problem/${childProblems[step + 1].id}`);
      setStep(step + 1);
    }
  };

  const contextValue: ProblemContextType = {
    childProblemLength: childProblems.length,
    onPrev,
    onNext,
  };

  return <ProblemContext.Provider value={contextValue}>{children}</ProblemContext.Provider>;
};
