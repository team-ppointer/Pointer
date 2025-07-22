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
    if (data?.data?.groups && data.data.groups.length !== 0) {
      setQnaList([...data.data.groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    }
  }, [data]);

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-[3.2rem] overflow-y-auto py-[3.2rem]'>
      {isSuccess &&
        qnaList.length !== 0 &&
        qnaList.map((group) => <QnaListContent key={group.order} data={group} />)}
      {isSuccess &&
        qnaList.length !== 0 &&
        qnaList.map((group) => <QnaListContent key={group.order} data={group} />)}
      {isSuccess &&
        qnaList.length !== 0 &&
        qnaList.map((group) => <QnaListContent key={group.order} data={group} />)}
      {isSuccess &&
        qnaList.length !== 0 &&
        qnaList.map((group) => <QnaListContent key={group.order} data={group} />)}
    </div>
  );
};

export default QnaList;
