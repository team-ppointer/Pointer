'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

import { Header, ImageContainer } from '@components';
import { useReportContext } from '@/hooks/report';
import postPointingSubmit from '@/apis/controller/submit/postPointingSubmit';
import { PointingCard } from '@/components/report';

const Page = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const childNumber = searchParams.get('childNumber');

  const { no, childProblems, problemContent, pointings } = useReportContext();

  // 1단계: 포인팅만 보여줌 (포인팅 질문 + 버튼)
  // 2단계: 포인팅 + 처방 보여줌 (처방 질문 + 버튼 활성화)
  // 3단계: 완료 상태 (처방 + "답변을 완료했어요" 비활성 버튼)
  const [visibleCount, setVisibleCount] = useState(1);
  const [pointingSteps, setPointingSteps] = useState([1]);

  const problemContentsViewer =
    type === 'child' ? childProblems[Number(childNumber) - 1]?.problemContent : problemContent;

  const pointingsContents =
    type === 'child' ? childProblems[Number(childNumber) - 1]?.pointings : pointings;

  const title = `${type === 'child' ? '새끼' : '메인'} 문제 ${no}${
    type === 'child' ? `-${childNumber}` : ''
  }번`;

  const handlePointingAnswer = (index: number) => {
    const newSteps = [...pointingSteps];
    newSteps[index] = 2;
    setPointingSteps(newSteps);
  };

  const handlePrescriptionAnswer = async (index: number, isUnderstood: boolean) => {
    const pointingId = pointingsContents[index].id || pointingsContents[index].id;
    await postPointingSubmit(pointingId, isUnderstood);

    const newSteps = [...pointingSteps];
    newSteps[index] = 3;
    setPointingSteps(newSteps);

    if (index === visibleCount - 1 && visibleCount < pointingsContents.length) {
      setVisibleCount(visibleCount + 1);
      setPointingSteps([...newSteps, 1]);
      PointingCard;
    }
  };

  if (!problemContentsViewer || !pointingsContents || pointingsContents.length === 0) {
    return <></>;
  }

  return (
    <div className='flex h-screen flex-col'>
      <Header title={`${title} 포인팅`} iconType='back' />

      <div className='px-[2rem] pt-[6rem] pb-[2rem]'>
        <ImageContainer className='w-full'>
          <ProblemViewer problem={problemContentsViewer} loading={false} />
        </ImageContainer>
      </div>

      <div className='mb-[2rem] flex-1 overflow-y-auto px-[2rem] pb-[2rem]'>
        <div className='flex flex-col gap-[1.6rem]'>
          {pointingsContents.slice(0, visibleCount).map((pointingContent, index) => (
            <PointingCard
              key={index}
              pointingId={pointingContent.id}
              pointingContent={pointingContent}
              step={pointingSteps[index]}
              onPointingAnswer={() => handlePointingAnswer(index)}
              onPrescriptionAnswer={(isUnderstood) => handlePrescriptionAnswer(index, isUnderstood)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
