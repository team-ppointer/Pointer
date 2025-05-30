'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import { IcRight, IcThumbtack } from '@svg';
import { ImageContainer, NavigationFooter, ProgressHeader } from '@components';
import { trackEvent } from '@utils';
import { useReportContext } from '@/hooks/report';
import { TabMenu } from '@/components/report';

const Page = () => {
  const router = useRouter();
  const { publishId, problemId } = useParams();
  const {
    problemNumber,
    answerType,
    answer,
    mainAnalysisImageUrl,
    mainHandwritingExplanationImageUrl,
  } = useReportContext();
  const [selectedTab, setSelectedTab] = useState<'분석' | '손해설'>('분석');

  const handleClickTab = (tab: '분석' | '손해설') => {
    trackEvent('report_analysis_tab_click', {
      tab,
    });
    setSelectedTab(tab);
  };

  const handleClickReadingTip = () => {
    trackEvent('report_analysis_reading_tip_click');
    router.push(`/report/${publishId}/${problemId}/reading-tip`);
  };

  const handleClickNext = () => {
    trackEvent('report_analysis_next_button_click_to_prescription');
    router.push(`/report/${publishId}/${problemId}/prescription`);
  };

  if (!mainAnalysisImageUrl || !mainHandwritingExplanationImageUrl) {
    return <></>;
  }

  return (
    <>
      <ProgressHeader progress={33} />
      <main className='min-h-[100dvh] justify-between px-[2rem] pt-[8rem] pb-[18rem]'>
        <header className='flex items-center justify-between'>
          <h1 className='font-bold-18 text-main my-[0.8rem]'>메인 문제 {problemNumber}번</h1>
          <div className='flex items-center gap-[0.8rem]'>
            <span className='font-medium-16 text-black'>정답</span>
            <span className='font-medium-16 text-main'>
              {answer}
              {answerType === 'MULTIPLE_CHOICE' && '번'}
            </span>
          </div>
        </header>
        <div className='mt-[2.4rem] flex flex-col gap-[1.6rem]'>
          <TabMenu
            leftMenu='분석'
            rightMenu='손해설'
            selectedTab={selectedTab}
            onTabChange={handleClickTab}
          />
          <ImageContainer className={`${selectedTab === '분석' ? 'block' : 'hidden'}`}>
            <Image
              src={mainAnalysisImageUrl ?? ''}
              alt='analysis'
              className={`w-full object-contain`}
              width={700}
              height={200}
              priority
            />
          </ImageContainer>
          <ImageContainer className={`${selectedTab === '손해설' ? 'block' : 'hidden'}`}>
            <Image
              src={mainHandwritingExplanationImageUrl ?? ''}
              alt='handWriting'
              className={`w-full object-contain`}
              width={700}
              height={200}
              priority
            />
          </ImageContainer>
        </div>
        <div className='bg-background fixed right-0 bottom-[6.2rem] left-0 mx-auto h-[11.8rem] max-w-[768px] p-[2rem]'>
          <button
            type='button'
            className='border-sub1 flex w-full items-center justify-between rounded-[1.6rem] border bg-white px-[2rem] py-[1.6rem]'
            onClick={handleClickReadingTip}>
            <div className='flex items-center gap-[1.6rem]'>
              <IcThumbtack width={24} height={24} />
              <div className='flex flex-col items-start gap-[0.2rem]'>
                <p className='font-medium-12 text-main'>2등급 미만의 초심자라면</p>
                <p className='font-bold-16 text-main'>문제를 읽어내려갈 때</p>
              </div>
            </div>
            <IcRight width={24} height={24} />
          </button>
        </div>
        <NavigationFooter nextLabel='포인팅' onClickNext={handleClickNext} />
      </main>
    </>
  );
};

export default Page;
