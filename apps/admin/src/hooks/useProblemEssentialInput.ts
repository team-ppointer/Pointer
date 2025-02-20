import { ExamType, ProblemType } from '@types';
import { useState } from 'react';

const useProblemEssentialInput = () => {
  const [problemType, setProblemType] = useState<ProblemType>('GICHUL_PROBLEM');
  const [practiceTest, setPracticeTest] = useState<ExamType | null>(null);
  const [practiceTestNumber, setPracticeTestNumber] = useState<number>();

  const handleChangeType = (type: ProblemType) => {
    setProblemType(type);
  };

  const handlePracticeTest = (exam: ExamType | null) => {
    setPracticeTest(exam);
  };

  const handleChangeNumber = (num: number) => {
    setPracticeTestNumber(num);
  };

  return {
    problemType,
    practiceTest,
    practiceTestNumber,
    handleChangeType,
    handlePracticeTest,
    handleChangeNumber,
  };
};

export default useProblemEssentialInput;
