'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { components } from '@schema';
import { IcMore } from '@svg';
import { deleteQna } from '@/apis';
import { showToast } from '@utils';

import DeleteButton from './DeleteButton';

type QnaListContentProps = {
  data: components['schemas']['QnAGroupItem'];
  onClose: () => void;
  refetch: () => void;
};

const QnaListContent = ({ data, onClose, refetch }: QnaListContentProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean[]>((data.data ?? []).map(() => false));
  const handleOnClick = (index: number) => {
    if (data?.data && data.data[index]) {
      router.push(`/qna?qnaId=${data.data[index].id}`);
      onClose();
    }
  };
  const handleDelete = (qnaId: number) => {
    deleteQna(qnaId)
      .then(() => {
        onClose();
        refetch();
        window.location.reload();
      })
      .catch((error) => {
        showToast.error('QnA 삭제에 실패했습니다. 다시 시도해주세요.');
      });
  };
  return (
    <div className='flex w-full flex-col items-start justify-start gap-[1.7rem]'>
      <p className='text-main font-medium-14'>{data?.weekName}</p>
      <div className='flex w-full flex-col items-start justify-start gap-[2.6rem]'>
        {data?.data?.map((item, index) => (
          <div key={item.id} className='relative flex w-full flex-row items-start justify-between'>
            <div
              onClick={() => handleOnClick(index)}
              className='flex w-full flex-row items-center justify-start gap-[0.8rem]'>
              <p className='font-medium-16 text-black'>{item.title}</p>
              <div className='bg-main flex h-[2rem] w-[2rem] items-center justify-center rounded-full text-white'>
                {item.unreadCount}
              </div>
            </div>
            <IcMore
              className='cursor-pointer'
              width={24}
              height={24}
              onClick={() =>
                setIsOpen(
                  !isOpen[index]
                    ? isOpen.map((_, i) => (i === index ? true : false))
                    : isOpen.map(() => false)
                )
              }
            />
            {isOpen[index] && <DeleteButton onClick={() => handleDelete(item.id)} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QnaListContent;
