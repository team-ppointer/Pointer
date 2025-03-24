'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { IcRight, IcThumbtack } from '@svg';
import { NavigationFooter, ProgressHeader } from '@components';

import { useReport } from '@/hooks/report';
import { TabMenu } from '@/components/report';

const Page = () => {
  const router = useRouter();
  const { publishId, problemId } = useParams();
  const { problemNumber, mainAnalysisImageUrl, mainHandwritingExplanationImageUrl } = useReport();
  const [selectedTab, setSelectedTab] = useState<'분석' | '손해설'>('분석');
  return (
    <>
      <ProgressHeader progress={33} />
      <main className='px-[2rem] py-[8rem]'>
        <h1 className='font-bold-18 text-main my-[0.8rem]'>메인 문제 {problemNumber}번</h1>
        <div className='mt-[2.4rem] flex flex-col gap-[1.6rem]'>
          <TabMenu
            leftMenu='분석'
            rightMenu='손해설'
            selectedTab={selectedTab}
            onTabChange={(tab) => setSelectedTab(tab)}
          />
          <img
            src={mainAnalysisImageUrl}
            alt='analysis'
            className={`w-full rounded-[1.6rem] object-contain ${selectedTab === '분석' ? 'block' : 'hidden'}`}
          />
          <img
            src={mainHandwritingExplanationImageUrl}
            alt='handWriting'
            className={`w-full rounded-[1.6rem] object-contain ${selectedTab === '손해설' ? 'block' : 'hidden'}`}
          />

          <Link href={`/report/${publishId}/${problemId}/reading-tip`}>
            <button
              type='button'
              className='border-sub1 flex w-full items-center justify-between rounded-[1.6rem] border bg-white px-[2rem] py-[1.6rem]'>
              <div className='flex items-center gap-[1.6rem]'>
                <IcThumbtack width={24} height={24} />
                <div className='flex flex-col items-start gap-[0.2rem]'>
                  <p className='font-medium-12 text-main'>2등급 미만의 초심자라면</p>
                  <p className='font-bold-16 text-main'>문제를 읽어내려갈 때</p>
                </div>
              </div>
              <IcRight width={24} height={24} />
            </button>
          </Link>
        </div>
        <NavigationFooter
          nextLabel='한 걸음 더'
          onClickNext={() => router.push(`/report/${publishId}/${problemId}/advanced`)}
        />
      </main>
    </>
  );
};

export default Page;
