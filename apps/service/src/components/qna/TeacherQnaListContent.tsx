'use client';
import { useRouter } from 'next/navigation';

import { components } from '@schema';

type TeacherQnaListContentProps = {
  data: components['schemas']['QnAGroupItem'];
  onClose: () => void;
};

const TeacherQnaListContent = ({ data, onClose }: TeacherQnaListContentProps) => {
  const router = useRouter();

  const handleOnClick = (index: number) => {
    if (data?.data && data.data[index]) {
      router.push(`/teacher/qna?qnaId=${data.data[index].id}`);
      onClose();
    }
  };
  return (
    <div className='flex w-full flex-col items-start justify-start gap-[1.7rem]'>
      <p className='text-main font-medium-14'>{data?.weekName}</p>
      <div className='flex w-full flex-col items-start justify-start gap-[2.6rem]'>
        {data?.data?.map((item, index) => (
          <div key={item.id} className='relative flex w-full flex-row items-start justify-between'>
            <div
              onClick={() => handleOnClick(index)}
              className='flex flex-row items-center justify-start gap-[0.8rem]'>
              <p className='font-medium-16 text-black'>{item.title}</p>
              <div className='bg-main flex h-[2rem] w-[2rem] items-center justify-center rounded-full text-white'>
                {item.unreadCount}
              </div>
            </div>
            <div className='bg-lightgray300 text-midgray100 font-medium-12 rounded-[0.4rem] px-[0.8rem] py-[0.2rem]'>
              {item.studentName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherQnaListContent;
