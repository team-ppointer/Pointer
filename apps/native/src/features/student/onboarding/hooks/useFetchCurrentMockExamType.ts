import { useEffect } from 'react';

import { TanstackQueryClient } from '@apis/client';

import { useOnboardingStore } from '../store/useOnboardingStore';

const useFetchCurrentMockExamType = () => {
  const setCurrentMockExamType = useOnboardingStore((state) => state.setCurrentMockExamType);
  const setCurrentTypeStatus = useOnboardingStore((state) => state.setCurrentTypeStatus);

  const query = TanstackQueryClient.useQuery(
    'get',
    '/api/student/mock-exam/current-type',
    {},
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );

  const { data, isPending, isFetching, isError, refetch } = query;

  useEffect(() => {
    if (isPending || isFetching) {
      setCurrentTypeStatus('loading');
      return;
    }
    if (isError) {
      setCurrentMockExamType(null);
      setCurrentTypeStatus('error');
      return;
    }
    setCurrentMockExamType(data?.type ? data : null);
    setCurrentTypeStatus('resolved');
  }, [data, isError, isPending, isFetching, setCurrentMockExamType, setCurrentTypeStatus]);

  return { refetch };
};

export default useFetchCurrentMockExamType;
