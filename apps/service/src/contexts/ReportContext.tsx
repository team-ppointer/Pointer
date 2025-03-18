'use client';

import { createContext } from 'react';

type ReportContextType = {
  analysis: string;
  handWriting: string;
  readingTip: string;
  advanced: string;
  prescription: {
    childProblem: {
      problem: string;
      solution: string;
    }[];
    mainProblem: {
      problem: string;
      solution: string;
    };
  };
};
export const ReportContext = createContext<ReportContextType | null>(null);

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const imageData = {
    analysis: 'https://placehold.co/600x400',
    handWriting: 'https://placehold.co/600x400',
    readingTip: 'https://placehold.co/600x400',
    advanced: 'https://placehold.co/600x400',
    prescription: {
      childProblem: [
        {
          problem: 'https://placehold.co/600x400',
          solution: 'https://placehold.co/600x400',
        },
      ],
      mainProblem: {
        problem: 'https://placehold.co/600x400',
        solution: 'https://placehold.co/600x400',
      },
    },
  };

  return <ReportContext.Provider value={imageData}>{children}</ReportContext.Provider>;
};
