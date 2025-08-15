'use client';
import { createContext, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { useGetProblemById, useGetProblemTeacherById } from '@apis';

export interface ProblemContextType {
  childProblemLength: number;
  onPrev: () => void;
  onNext: () => void;
  initStep: () => void;
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

  const teacherResult = useGetProblemTeacherById({
    publishId: +publishId,
    problemId: +problemId,
    studentId: +studentId,
    enabled: isTeacherPage && !!studentId,
  });

  const studentResult = useGetProblemById({
    publishId: +publishId,
    problemId: +problemId,
    enabled: !isTeacherPage,
  });

  const data = isTeacherPage ? teacherResult.data : studentResult.data;

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

  const initStep = () => {
    setStep(0);
  };

  const contextValue: ProblemContextType = {
    childProblemLength: childProblems.length,
    onPrev,
    onNext,
    initStep,
  };

  return <ProblemContext.Provider value={contextValue}>{children}</ProblemContext.Provider>;
};
