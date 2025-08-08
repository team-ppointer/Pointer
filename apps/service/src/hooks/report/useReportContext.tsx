import { useContext } from 'react';

import { ReportContext } from '@contexts';

const useReportContext = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReportContext is not found');
  }
  return context;
};

export default useReportContext;
