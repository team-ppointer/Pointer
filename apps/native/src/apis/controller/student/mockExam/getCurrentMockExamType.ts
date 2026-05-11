import type { components } from '@schema';
import { client } from '@apis/client';

type MockExamTypeResp = components['schemas']['MockExamTypeResp'];

export const CURRENT_MOCK_EXAM_TYPE_QUERY_KEY = [
  'get',
  '/api/student/mock-exam/current-type',
  {},
] as const;

const getCurrentMockExamType = async (): Promise<MockExamTypeResp | null> => {
  const { data, error, response } = await client.GET('/api/student/mock-exam/current-type');

  if (__DEV__) {
    console.log('[Onboarding][MockExam] current-type raw response:', {
      status: response.status,
      data,
      error,
    });
  }

  if (error) throw error;

  return data?.type ? data : null;
};

export default getCurrentMockExamType;
