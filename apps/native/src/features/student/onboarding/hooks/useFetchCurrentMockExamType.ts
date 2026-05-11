import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  CURRENT_MOCK_EXAM_TYPE_QUERY_KEY,
  getCurrentMockExamType,
} from '@apis/controller/student/mockExam';

import { useOnboardingStore } from '../store/useOnboardingStore';

const useFetchCurrentMockExamType = () => {
  const setCurrentMockExamType = useOnboardingStore((state) => state.setCurrentMockExamType);
  const setCurrentTypeStatus = useOnboardingStore((state) => state.setCurrentTypeStatus);

  const query = useQuery({
    queryKey: CURRENT_MOCK_EXAM_TYPE_QUERY_KEY,
    queryFn: getCurrentMockExamType,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const { data, error, isPending, isFetching, isError, refetch } = query;

  useEffect(() => {
    if (isPending || isFetching) {
      setCurrentTypeStatus('loading');
      return;
    }
    if (isError) {
      if (__DEV__) {
        console.log('[Onboarding][MockExam] current-type prefetch failed:', error);
      }
      setCurrentMockExamType(null);
      setCurrentTypeStatus('error');
      return;
    }
    const currentMockExamType = data ?? null;
    if (__DEV__) {
      console.log('[Onboarding][MockExam] current-type prefetch resolved:', {
        normalized: currentMockExamType,
      });
    }
    setCurrentMockExamType(currentMockExamType);
    setCurrentTypeStatus('resolved');
  }, [data, error, isError, isPending, isFetching, setCurrentMockExamType, setCurrentTypeStatus]);

  return { refetch };
};

export default useFetchCurrentMockExamType;
