'use client';
import { Divider, NavigationFooter, ProgressHeader } from '@components';
import { useParams, useRouter } from 'next/navigation';

import { PrescriptionCard } from '@/components/report';
import { useReportContext } from '@/hooks/report';

const Page = () => {
  const router = useRouter();
  const { publishId, problemId } = useParams();

  const { problemNumber, prescription } = useReportContext();
  const childProblems = prescription?.childProblem ?? [];
  const mainProblem = prescription?.mainProblem ?? {};

  return (
    <>
      <ProgressHeader progress={100} />
      <main className='px-[2rem] py-[8rem]'>
        <h1 className='font-bold-18 text-main my-[0.8rem]'>포인팅</h1>

        <ul className='flex flex-col gap-[1.6rem] pt-[1.2rem]'>
          {childProblems.map((childProblem, childProblemIndex) => {
            return (
              <PrescriptionCard
                key={childProblemIndex}
                status={childProblem.submitStatus}
                title={`새끼 문항 ${problemNumber}-${childProblemIndex + 1}번`}
                onClick={() =>
                  router.push(
                    `/report/${publishId}/${problemId}/prescription/detail?type=child&childNumber=${childProblemIndex + 1}`
                  )
                }
              />
            );
          })}

          <Divider />
          <PrescriptionCard
            status={mainProblem.submitStatus}
            title={`메인 문항 ${problemNumber}번`}
            onClick={() =>
              router.push(`/report/${publishId}/${problemId}/prescription/detail?type=main`)
            }
          />
        </ul>

        <NavigationFooter
          prevLabel='한 걸음 더'
          nextLabel='리스트로'
          onClickPrev={() => router.push(`/report/${publishId}/${problemId}/advanced`)}
          onClickNext={() => router.push(`/problem/list/${publishId}`)}
        />
      </main>
    </>
  );
};

export default Page;
