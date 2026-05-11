import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { TanstackQueryClient } from '@apis/client';
import type { components } from '@schema';

import { useOnboardingStore } from '../store/useOnboardingStore';

type MockExamTypeResp = components['schemas']['MockExamTypeResp'];

type ResolveCurrentTypeResult =
  | { ok: true; currentMockExamType: MockExamTypeResp | null }
  | { ok: false };

const CURRENT_TYPE_RETRY_COUNT = 2;

const CURRENT_TYPE_RETRY_FAIL_TITLE = '모의고사 정보를 불러오지 못했어요';
const CURRENT_TYPE_RETRY_FAIL_MESSAGE = '네트워크 상태를 확인한 뒤 다시 시도해 주세요.';

const useResolveCurrentMockExamType = () => {
  const [isResolvingCurrentType, setIsResolvingCurrentType] = useState(false);
  const resolveLockRef = useRef(false);

  const setCurrentMockExamType = useOnboardingStore((state) => state.setCurrentMockExamType);
  const setCurrentTypeStatus = useOnboardingStore((state) => state.setCurrentTypeStatus);

  const { refetch } = TanstackQueryClient.useQuery(
    'get',
    '/api/student/mock-exam/current-type',
    {},
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      enabled: false,
      retry: false,
    }
  );

  const resolveCurrentMockExamType = useCallback(async (): Promise<ResolveCurrentTypeResult> => {
    if (resolveLockRef.current) return { ok: false };

    resolveLockRef.current = true;
    setIsResolvingCurrentType(true);
    setCurrentTypeStatus('loading');

    try {
      for (let attempt = 0; attempt < CURRENT_TYPE_RETRY_COUNT; attempt += 1) {
        const result = await refetch();

        if (!result.isError) {
          const currentMockExamType = result.data?.type ? result.data : null;
          setCurrentMockExamType(currentMockExamType);
          setCurrentTypeStatus('resolved');
          return { ok: true, currentMockExamType };
        }
      }
    } catch (error) {
      console.error('[useResolveCurrentMockExamType] current-type retry failed:', error);
    } finally {
      resolveLockRef.current = false;
      setIsResolvingCurrentType(false);
    }

    setCurrentMockExamType(null);
    setCurrentTypeStatus('error');
    Alert.alert(CURRENT_TYPE_RETRY_FAIL_TITLE, CURRENT_TYPE_RETRY_FAIL_MESSAGE);
    return { ok: false };
  }, [refetch, setCurrentMockExamType, setCurrentTypeStatus]);

  return { resolveCurrentMockExamType, isResolvingCurrentType };
};

export default useResolveCurrentMockExamType;
