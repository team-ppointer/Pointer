'use client';
import { Divider, NavigationFooter, ProgressHeader } from '@components';
import { useParams, useRouter } from 'next/navigation';

import { PrescriptionCard } from '@/components/report';
import { useReport } from '@/hooks/report';

const Page = () => {
  const router = useRouter();
  const { publishId, problemId } = useParams();

  const { problemNumber, prescription } = useReport();

  return (
    <>
      <ProgressHeader progress={100} />
      <main className='px-[2rem] py-[8rem]'>
        <h1 className='font-bold-18 text-main my-[0.8rem]'>포인팅</h1>

        <ul className='flex flex-col gap-[1.6rem] pt-[1.2rem]'>
          {prescription.childProblem.map((childProblem) => {
            return (
              <PrescriptionCard
                key={childProblem.childProblemNumber}
                status='진단 완료'
                title={`새끼 문항 ${problemNumber}-${childProblem.childProblemNumber}번`}
                onClick={() =>
                  router.push(
                    `/report/${publishId}/${problemId}/prescription/detail?type=child&childNumber=${childProblem.childProblemNumber}`
                  )
                }
              />
            );
          })}

          <Divider />
          <PrescriptionCard
            status='진단 완료'
            title={`메인 문항 ${problemNumber}번`}
            onClick={() =>
              router.push(`/report/${publishId}/${problemId}/prescription/detail?type=main`)
            }
          />
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
