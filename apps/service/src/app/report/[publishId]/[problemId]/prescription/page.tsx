'use client';
import { useParams, useRouter } from 'next/navigation';

import { Divider, NavigationFooter, ProgressHeader } from '@components';
import { trackEvent } from '@utils';
import { PrescriptionCard } from '@/components/report';
import { useReportContext } from '@/hooks/report';

const Page = () => {
  const router = useRouter();
  const { publishId, problemId } = useParams();

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
    trackEvent('report_prescription_prev_button_click_to_analysis');
    router.push(`/report/${publishId}/${problemId}/analysis`);
  };

  const handleClickNext = () => {
    trackEvent('report_prescription_next_button_click_to_advanced');
    router.push(`/report/${publishId}/${problemId}/advanced`);
  };

  return (
    <>
      <ProgressHeader progress={66} />
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
          {childProblems.length > 0 && <Divider />}
          <PrescriptionCard
            status={mainProblem.submitStatus}
            title={`메인 문제 ${problemNumber}번`}
            onClick={handleClickMainPrescription}
          />
        </ul>

        <NavigationFooter
          prevLabel='해설'
          nextLabel='한 걸음 더'
          onClickPrev={handleClickPrev}
          onClickNext={handleClickNext}
        />
      </main>
    </>
  );
};

export default Page;
