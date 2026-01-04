import { client } from '@/apis/client';

const putReadNotice = async (noticeId: number) => {
  return await client.PUT(`/api/student/notice/read/{noticeId}`, {
    params: {
      path: {
        noticeId: noticeId,
      },
    },
  });
};

export default putReadNotice;
