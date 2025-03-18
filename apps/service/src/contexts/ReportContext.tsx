'use client';

import { createContext } from 'react';

type ReportContextType = {
  problemNumber: number;
  analysis: string;
  handWriting: string;
  readingTip: string;
  advanced: string;
  prescription: {
    childProblem: {
      childProblemNumber: number;
      problem: string;
      solution: string[];
    }[];
    mainProblem: {
      problem: string;
      solution: string[];
    };
  };
};
export const ReportContext = createContext<ReportContextType | null>(null);

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const imageData = {
    problemNumber: 2,
    analysis: 'https://placehold.co/600x400',
    handWriting: 'https://placehold.co/400',
    readingTip: 'https://placehold.co/400x600',
    advanced: 'https://placehold.co/600x400',
    prescription: {
      childProblem: [
        {
          childProblemNumber: 1,
          problem: 'https://placehold.co/600x400',
          solution: ['https://placehold.co/200x400'],
        },
        {
          childProblemNumber: 2,
          problem: 'https://placehold.co/600x400',
          solution: ['https://placehold.co/200x400'],
        },
        {
          childProblemNumber: 3,
          problem: 'https://placehold.co/600x400',
          solution: ['https://placehold.co/200x400'],
        },
      ],
      mainProblem: {
        problem: 'https://placehold.co/600x400',
        solution: ['https://placehold.co/200x400'],
      },
    },
  };

  return <ReportContext.Provider value={imageData}>{children}</ReportContext.Provider>;
};
