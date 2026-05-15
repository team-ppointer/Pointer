import { type components } from '@schema';
import { client } from '@apis/client';

type MockExamResultSubmitRequest = components['schemas']['MockExamResultSubmitRequest'];

const postMockExam = async (data: MockExamResultSubmitRequest) => {
  return await client.POST('/api/student/mock-exam', {
    body: data,
  });
};

export default postMockExam;
