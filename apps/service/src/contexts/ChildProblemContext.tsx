import { createContext, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const childProblemIds: string[] = ['9', '10', '11'];

export interface ChildProblemContextType {
  mainProblemImageUrl: string;
  onPrev: () => void;
  onNext: () => void;
}

export const ChildProblemContext = createContext<ChildProblemContextType | null>(null);

export const ChildProblemProvider = ({ children }: { children: React.ReactNode }) => {
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();
  const router = useRouter();
  const [step, setStep] = useState<number>(0);

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

  const contextValue: ChildProblemContextType = {
    mainProblemImageUrl: '',
    onPrev,
    onNext,
  };

  return (
    <ChildProblemContext.Provider value={contextValue}>{children}</ChildProblemContext.Provider>
  );
};
