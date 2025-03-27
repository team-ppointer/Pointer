import { useContext } from 'react';
import { ReportContext } from '@contexts';

const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('ReportContext is not found');
  }
  return context;
};

export default useReport;
