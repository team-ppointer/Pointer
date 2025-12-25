import { client } from '@apis';
import { components } from '@schema';

type StudentUpdateRequest = components['schemas']['StudentUpdateRequest'];

const putMe = async (data: StudentUpdateRequest) => {
  try {
    const response = await client.PUT('/api/student/me', {
      body: data,
    });
    return { isSuccess: true, data: response.data };
  } catch (error) {
    return { isSuccess: false, error: error };
  }
};

export default putMe;
