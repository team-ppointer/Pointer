'use client';
import { Divider, NavigationFooter } from '@components';
import { useParams, useRouter } from 'next/navigation';

import { PrescriptionCard, ReportHeader } from '@/components/report';

const Page = () => {
  const router = useRouter();
  const { publishId } = useParams();

  return (
    <>
      <ReportHeader progress={100} />
      <main className='px-[2rem] py-[8rem]'>
        <h1 className='font-bold-18 text-main my-[0.8rem]'>포인팅</h1>

        <ul className='flex flex-col gap-[1.6rem] pt-[1.2rem]'>
          <PrescriptionCard status='진단 완료' title='새끼 문항 1번' onClick={() => {}} />
          <PrescriptionCard status='진단 완료' title='새끼 문항 2번' onClick={() => {}} />
          <PrescriptionCard status='진단 완료' title='새끼 문항 3번' onClick={() => {}} />

          <Divider />
          <PrescriptionCard status='진단 완료' title='메인 문항 1번' onClick={() => {}} />
        </ul>

        <NavigationFooter
          prevLabel='한 걸음 더'
          nextLabel='리스트로'
          onClickPrev={() => router.back()}
          onClickNext={() => router.push(`/problem/${publishId}`)}
        />
      </main>
    </>
  );
};

export default Page;
