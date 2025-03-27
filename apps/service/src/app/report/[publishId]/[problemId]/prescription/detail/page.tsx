'use client';

import { Header } from '@components';
import { useSearchParams } from 'next/navigation';

import { useReportContext } from '@/hooks/report';

const Page = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const childNumber = searchParams.get('childNumber');

  const { problemNumber, prescription } = useReportContext();

  const childProblems = prescription?.childProblem ?? [];
  const mainProblem = prescription?.mainProblem ?? {};

  const problemImageUrl =
    type === 'child' ? childProblems[Number(childNumber) - 1]?.imageUrl : mainProblem.imageUrl;

  const solutionImageUrls =
    type === 'child'
      ? childProblems[Number(childNumber) - 1]?.prescriptionImageUrls
      : mainProblem.prescriptionImageUrls;

  const title = `${type === 'child' ? '새끼' : '메인'} 문제 ${problemNumber}${
    type === 'child' ? `-${childNumber}` : ''
  }번`;

  return (
    <>
      <Header title='진단 및 처방' iconType='back' />
      <main className='px-[2rem] py-[8rem]'>
        <h1 className='font-bold-18 text-main my-[0.8rem]'>{title}</h1>
        <div className='mt-[1.6rem] flex flex-col gap-[1.6rem] md:flex-row'>
          <div className='w-full'>
            <img src={problemImageUrl} alt='problem' className='w-full rounded-[1.6rem]' />
          </div>
          <div className='flex w-full flex-col gap-[1.6rem]'>
            {(solutionImageUrls ?? []).map((url, index) => (
              <img key={index} src={url} alt='solution' className='w-full rounded-[1.6rem]' />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;
