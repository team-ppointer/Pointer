'use client';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import { NavigationFooter, SmallButton, ProgressHeader, ImageContainer } from '@components';
import { trackEvent } from '@utils';
import { useReportContext } from '@/hooks/report';

const Page = () => {
  const { publishId, problemId } = useParams();
  const router = useRouter();

  const { problemNumber, seniorTipImageUrl, prescription } = useReportContext();

  const mainImageUrl = prescription?.mainProblem?.imageUrl;

  const handleClickShowMainProblem = () => {
    trackEvent('report_advanced_show_main_problem_button_click');
    router.push(`/image-modal?imageUrl=${mainImageUrl}`);
  };

  const handleClickPrev = () => {
    trackEvent('report_advanced_prev_button_click_to_prescription');
    router.push(`/report/${publishId}/${problemId}/prescription`);
  };

  const handleClickNext = () => {
    trackEvent('report_advanced_next_button_click_to_list');
    router.push(`/problem/list/${publishId}`);
  };

  if (!seniorTipImageUrl) {
    return <></>;
  }

  return (
    <>
      <ProgressHeader progress={100} />
      <main className='px-[2rem] py-[8rem]'>
        <div className='flex items-center justify-between'>
          <h1 className='font-bold-18 text-main my-[0.8rem]'>한 걸음 더</h1>
          <SmallButton
            className='translate-x-[1.2rem]'
            variant='underline'
            sizeType='small'
            onClick={handleClickShowMainProblem}>
            메인 문제 {problemNumber}번 다시 보기
          </SmallButton>
        </div>
        <div className='mt-[2.4rem] flex flex-col gap-[1.6rem]'>
          <ImageContainer>
            <Image
              src={seniorTipImageUrl ?? ''}
              alt='advanced'
              className={`w-full object-contain`}
              width={700}
              height={200}
              priority
            />
          </ImageContainer>
        </div>
        <NavigationFooter
          prevLabel='포인팅'
          nextLabel='리스트로'
          onClickPrev={handleClickPrev}
          onClickNext={handleClickNext}
        />
      </main>
    </>
  );
};

export default Page;
