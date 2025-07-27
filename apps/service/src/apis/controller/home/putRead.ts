import { client } from '@apis';

const putRead = async (noticeId: number) => {
  return await client.PUT(`/api/student/notice/read/{noticeId}`, {
    params: {
      path: {
        noticeId: noticeId,
      },
    },
  });
};

export default putRead;
