'use client';
import { Divider, NavigationFooter, ProgressHeader } from '@components';
import { useParams, useRouter } from 'next/navigation';
import { useTrackEvent } from '@hooks';

import { PrescriptionCard } from '@/components/report';
import { useReportContext } from '@/hooks/report';

const Page = () => {
  const router = useRouter();
  const { publishId, problemId } = useParams();
  const { trackEvent } = useTrackEvent();

  const { problemNumber, prescription } = useReportContext();
  const childProblems = prescription?.childProblem ?? [];
  const mainProblem = prescription?.mainProblem ?? {};

  const handleClickChildPrescription = (childProblemIndex: number) => {
    trackEvent('report_prescription_child_prescription_click', {
      problemNumber: `${problemNumber}-${childProblemIndex + 1}`,
    });
    router.push(
      `/report/${publishId}/${problemId}/prescription/detail?type=child&childNumber=${childProblemIndex + 1}`
    );
  };

  const handleClickMainPrescription = () => {
    trackEvent('report_prescription_main_prescription_click', {
      problemNumber: `${problemNumber}`,
    });
    router.push(`/report/${publishId}/${problemId}/prescription/detail?type=main`);
  };

  const handleClickPrev = () => {
    trackEvent('report_prescription_prev_button_click', {
      buttonLabel: '한 걸음 더',
    });
    router.push(`/report/${publishId}/${problemId}/advanced`);
  };

  const handleClickNext = () => {
    trackEvent('report_prescription_next_button_click', {
      buttonLabel: '리스트로',
    });
    router.push(`/problem/list/${publishId}`);
  };

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
                title={`새끼 문제 ${problemNumber}-${childProblemIndex + 1}번`}
                onClick={() => handleClickChildPrescription(childProblemIndex)}
              />
            );
          })}

          <Divider />
          <PrescriptionCard
            status={mainProblem.submitStatus}
            title={`메인 문제 ${problemNumber}번`}
            onClick={handleClickMainPrescription}
          />
        </ul>

        <NavigationFooter
          prevLabel='한 걸음 더'
          nextLabel='리스트로'
          onClickPrev={handleClickPrev}
          onClickNext={handleClickNext}
        />
      </main>
    </>
  );
};

export default Page;
