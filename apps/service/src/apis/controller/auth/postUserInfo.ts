import { client } from '@apis';

const postUserInfo = async (name: string, grade: number) => {
  try {
    const response = await client.POST('/api/student/auth/register/social', {
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

export default postUserInfo;
