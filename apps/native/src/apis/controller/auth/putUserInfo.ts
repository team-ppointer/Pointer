import { client } from '@/apis/client';

const putUserInfo = async (name: string, grade: number) => {
  try {
    const response = await client.PUT('/api/student/me', {
      body: {
        name: name,
        grade: grade,
      },
    });
    return { isSuccess: true, data: response.data };
  } catch (error) {
    return { isSuccess: false, error: error };
  }
};

export default putUserInfo;
