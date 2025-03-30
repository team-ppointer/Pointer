import { useContext } from 'react';

import { ProblemContext } from '@contexts';

const useProblemContext = () => {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error('useProblemContext is not found');
  }
  return context;
};

export default useProblemContext;
