import { client } from '@/apis/client';

type Props = {
  startAt: string;
  endAt: string;
  content: string;
  studentId: number;
};

const postTeacherNotice = async ({ startAt, endAt, content, studentId }: Props) => {
  const response = await client.POST(`/api/teacher/notice`, {
    body: {
      startAt,
      endAt,
      content,
      studentId,
    },
  });
  return response.data;
};

export default postTeacherNotice;
