import { ProblemAnswerType } from '@types';
import { useState } from 'react';

const useAnswerInput = () => {
  const [problemAnswerType, setProblemAnswerType] = useState<ProblemAnswerType>('MULTIPLE_CHOICE');
  const [answer, setAnswer] = useState<string | null>(null);

  const handleClickProblemAnswerType = (type: ProblemAnswerType) => {
    if (problemAnswerType === type) return;

    setAnswer(null);
    setProblemAnswerType(type);
  };

  const handleChangeAnswer = (value: string) => {
    setAnswer(value);
  };

  return {
    problemAnswerType,
    answer,
    handleClickProblemAnswerType,
    handleChangeAnswer,
  };
};

export default useAnswerInput;
