'use client';

import Image from 'next/image';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';
import { useParams, useRouter } from 'next/navigation';

import { Header, ImageContainer, SmallButton } from '@components';
import { useReportContext } from '@/hooks/report';
import { IcQuestion18 } from '@svg';

const Page = () => {
  const router = useRouter();
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();
  const { no, mainAnalysisImage, readingTipContent } = useReportContext();
  const handleClickQuestion = () => {
    router.push(
      `/qna/ask?publishId=${publishId}&problemId=${problemId}&type=PROBLEM_READING_TIP_CONTENT`
    );
  };

  if (!mainAnalysisImage || !readingTipContent) {
    return <></>;
  }

  return (
    <>
      <Header title='문제를 읽어내려갈 때' iconType='back' />
      <main className='px-[2rem] py-[8rem]'>
        <h1 className='font-bold-18 text-main my-[0.8rem]'>메인 문제 {no}번</h1>
        <div className='mt-[1.6rem] flex flex-col gap-[3.2rem]'>
          <div className='flex w-full flex-col gap-[1.2rem]'>
            <div className='flex items-center justify-between'>
              <h2 className='font-bold-16 text-main my-[0.8rem]'>문제 분석</h2>
              <SmallButton
                className='flex flex-row gap-[4px]'
                variant='white'
                sizeType='small'
                onClick={handleClickQuestion}>
                <IcQuestion18 className='h-[1.8rem] w-[1.8rem]' />
                질문하기
              </SmallButton>
            </div>
            <ImageContainer>
              <Image
                src={mainAnalysisImage.url ?? ''}
                alt='analysis'
                className={`w-full object-contain`}
                width={700}
                height={200}
                priority
              />
            </ImageContainer>
          </div>
          <div className='flex w-full flex-col gap-[1.2rem]'>
            <h2 className='font-bold-16 text-main my-[0.8rem]'>문제를 읽어내려갈 때</h2>
            <ImageContainer>
              <ProblemViewer problem={readingTipContent} />
            </ImageContainer>
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;
