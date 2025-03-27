import { useContext } from 'react';
import { ChildProblemContext } from '@contexts';

const useChildProblemContext = () => {
  const context = useContext(ChildProblemContext);
  if (!context) {
    throw new Error('useChildProblemContext is not found');
  }
  return context;
};

export default useChildProblemContext;
