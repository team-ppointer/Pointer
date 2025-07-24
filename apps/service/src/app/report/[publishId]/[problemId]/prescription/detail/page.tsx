'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { Button, Divider, Header, ImageContainer } from '@components';
import { useReportContext } from '@/hooks/report';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';
import PointingImageContainer from '@/components/report/PointingImageContainer';
import { IcBulb } from '@svg';

const Page = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const childNumber = searchParams.get('childNumber');

  const { no, childProblems, problemContent, pointings } = useReportContext();

  const problemContentsViewer =
    type === 'child' ? childProblems[Number(childNumber) - 1]?.problemContent : problemContent;

  console.log('pointings', pointings);

  const pointingsContents =
    type === 'child' ? childProblems[Number(childNumber) - 1]?.pointings : pointings;

  const title = `${type === 'child' ? '새끼' : '메인'} 문제 ${no}${
    type === 'child' ? `-${childNumber}` : ''
  }번`;

  if (!problemContentsViewer) {
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
          {pointingsContents &&
            pointingsContents.map((pointingsContent, index) => (
              <div
                className='border-sub1 flex flex-col gap-[2rem] rounded-[1.6rem] border bg-white p-[2rem]'
                key={index}>
                <PointingImageContainer
                  variant='pointing'
                  contents={pointingsContent.questionContent}
                />
                <Divider />
                <PointingImageContainer
                  key={index}
                  variant='prescription'
                  contents={pointingsContent.commentContent}
                />
                <div>
                  <div className='flex gap-[0.8rem]'>
                    <IcBulb width={20} height={20} />
                    <div className='flex flex-col gap-[0.4rem]'>
                      <h3 className='font-medium-16 flex text-[#1E1E21]'>
                        문제를 풀 때 &nbsp;<p className='text-main'>처방과 동일하게&nbsp;</p>
                        떠올렸나요?
                      </h3>
                      <p className='font-medium-12 text-lightgray500'>
                        답변 결과는 추후 개인 맞춤 문제 추천때 반영돼요
                      </p>
                    </div>
                  </div>
                  <div className='mt-[1.6rem] grid grid-cols-2 gap-[0.8rem]'>
                    <Button variant='light' onClick={() => {}}>
                      떠올렸어요
                    </Button>
                    <Button onClick={() => {}}>못 떠올렸어요</Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
