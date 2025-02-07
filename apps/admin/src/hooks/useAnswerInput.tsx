import { ProblemType } from '@types';
import { useState } from 'react';

const useAnswerInput = () => {
  const [problemType, setProblemType] = useState<ProblemType>('MULTIPLE_CHOICE');
  const [answer, setAnswer] = useState<string | null>(null);

  const handleClickProblemType = (type: ProblemType) => {
    if (problemType === type) return;

    setAnswer(null);
    setProblemType(type);
  };

  const handleChangeAnswer = (value: string) => {
    setAnswer(value);
  };

  return {
    problemType,
    answer,
    handleClickProblemType,
    handleChangeAnswer,
  };
};

export default useAnswerInput;
