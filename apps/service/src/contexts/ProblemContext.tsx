'use client';
import { createContext, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { useGetProblemById, useGetProblemTeacherById } from '@apis';

export interface ProblemContextType {
  childProblemLength: number;
  onPrev: () => void;
  onNext: () => void;
}

export const ProblemContext = createContext<ProblemContextType | null>(null);

export const ProblemProvider = ({ children }: { children: React.ReactNode }) => {
  const { publishId, problemId, studentId } = useParams<{
    publishId: string;
    problemId: string;
    studentId: string;
  }>();
  const pathname = usePathname();
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const isTeacherPage = pathname.includes('/teacher');

  let data;
  if (isTeacherPage && studentId) {
    const result = useGetProblemTeacherById(+publishId, +problemId, +studentId);
    data = result.data;
  } else {
    const result = useGetProblemById(+publishId, +problemId);
    data = result.data;
  }

  if (!data) {
    return null;
  }
  const childProblems = data?.childProblems ?? [];

  const baseUrl = isTeacherPage
    ? `/teacher/problem/${studentId}/solve/${publishId}/${problemId}`
    : `/problem/solve/${publishId}/${problemId}`;

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
