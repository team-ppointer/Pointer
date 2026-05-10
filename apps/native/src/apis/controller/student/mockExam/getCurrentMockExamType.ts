import { client } from '@apis/client';

const getCurrentMockExamType = async () => {
  return await client.GET('/api/student/mock-exam/current-type');
};

export default getCurrentMockExamType;
