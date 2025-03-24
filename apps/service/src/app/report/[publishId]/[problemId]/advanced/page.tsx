'use client';
import { NavigationFooter, SmallButton, ProgressHeader } from '@components';
import { useParams, useRouter } from 'next/navigation';

import { useReport } from '@/hooks/report';

const Page = () => {
  const { publishId, problemId } = useParams();
  const router = useRouter();

  const { advanced } = useReport();

  return (
    <>
      <ProgressHeader progress={66} />
      <main className='px-[2rem] py-[8rem]'>
        <div className='flex items-center justify-between'>
          <h1 className='font-bold-18 text-main my-[0.8rem]'>한 걸음 더</h1>
          <SmallButton
            variant='underline'
            sizeType='small'
            onClick={() => router.push(`/image-modal?imageUrl=${advanced}`)}>
            메인 문제 1번 다시 보기
          </SmallButton>
        </div>
        <div className='mt-[2.4rem] flex flex-col gap-[1.6rem]'>
          <img src={advanced} alt='advanced' className={`w-full rounded-[1.6rem] object-contain`} />
        </div>
        <NavigationFooter
          prevLabel='해설'
          nextLabel='진단 및 분석'
          onClickPrev={() => router.back()}
          onClickNext={() => router.push(`/report/${publishId}/${problemId}/prescription`)}
        />
      </main>
    </>
  );
};

export default Page;
