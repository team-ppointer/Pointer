'use client';
import { useEffect, useState } from 'react';

import useGetQnaList from '@/apis/controller/qna/useGetQnaList';
import { components } from '@schema';

import QnaListContent from './QnaListContent';

type QnaListProps = {
  search?: string;
};

const QnaList = ({ search }: QnaListProps) => {
  const { data, isSuccess } = useGetQnaList(search);
  const [qnaList, setQnaList] = useState<components['schemas']['QnAGroupItem'][]>([]);

  useEffect(() => {
    const groups = data?.data?.groups ?? [];
    const sortedGroups = [...groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const sortedString = JSON.stringify(sortedGroups);
    setQnaList((prev) => {
      if (JSON.stringify(prev) !== sortedString) {
        return sortedGroups;
      }
      return prev;
    });
  }, [data]);

  return (
    <div className='w-full flex-1 space-y-[3.2rem] overflow-y-scroll pb-[2rem]'>
      {isSuccess && qnaList.length !== 0 ? (
        qnaList.map((group) => <QnaListContent key={group.order} data={group} />)
      ) : (
        <div className='flex h-full w-full items-center justify-center'>
          <p className='text-lightgray500 font-medium-16'>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default QnaList;
