import { useContext } from 'react';

import { ReportContext } from '@contexts';

// TODO: 에러해결 필요!!
const useReportContext = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('ReportContext is not found');
  }
  return context;
};

export default useReportContext;
