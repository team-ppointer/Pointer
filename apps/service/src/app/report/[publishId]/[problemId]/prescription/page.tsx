'use client';
import { useParams, useRouter } from 'next/navigation';

import { BottomFixedArea, Divider, NavigationFooter, ProgressHeader } from '@components';
import { trackEvent } from '@utils';
import { AdvancedCard, PrescriptionCard } from '@/components/report';
import { useReportContext } from '@/hooks/report';

const Page = () => {
  const router = useRouter();
  const { publishId, problemId } = useParams();

  const { no, childProblems, progress, oneStepMoreContent } = useReportContext();

  const handleClickChildPrescription = (childProblemIndex: number) => {
    trackEvent('report_prescription_child_prescription_click', {
      problemNumber: `${no}-${childProblemIndex + 1}`,
    });
    router.push(
      `/report/${publishId}/${problemId}/prescription/detail?type=child&childNumber=${childProblemIndex + 1}`
    );
  };

  const handleClickMainPrescription = () => {
    trackEvent('report_prescription_main_prescription_click', {
      problemNumber: `${no}`,
    });
    router.push(`/report/${publishId}/${problemId}/prescription/detail?type=main`);
  };

  const handleClickPrev = () => {
    trackEvent('report_prescription_prev_button_click_to_analysis');
    router.push(`/report/${publishId}/${problemId}/analysis`);
  };

  const handleClickNext = () => {
    trackEvent('report_prescription_next_button_click_to_advanced');
    router.push(`/problem/list/${publishId}`);
  };

  const handleClickQuestion = () => {
    router.push(
      `/qna/ask?publishId=${publishId}&problemId=${problemId}&type=PROBLEM_ONE_STEP_MORE`
    );
  };

  return (
    <>
      <ProgressHeader />
      <main className='px-[2rem] py-[8rem]'>
        <h1 className='font-bold-18 text-main my-[0.8rem]'>포인팅</h1>

        <ul className='flex flex-col gap-[1.6rem] pt-[1.2rem]'>
          {childProblems.map((childProblem, childProblemIndex) => {
            return (
              <PrescriptionCard
                key={childProblemIndex}
                status={childProblem.progress}
                title={`새끼 문제 ${no}-${childProblemIndex + 1}번`}
                onClick={() => handleClickChildPrescription(childProblemIndex)}
              />
            );
          })}
          {childProblems.length > 0 && <Divider />}
          <PrescriptionCard
            status={progress}
            title={`메인 문제 ${no}번`}
            onClick={handleClickMainPrescription}
          />
          <AdvancedCard contents={oneStepMoreContent} handleClickQuestion={handleClickQuestion} />
        </ul>
        <BottomFixedArea>
          <NavigationFooter
            prevLabel='해설'
            nextLabel='문제 리스트'
            onClickPrev={handleClickPrev}
            onClickNext={handleClickNext}
          />
        </BottomFixedArea>
      </main>
    </>
  );
};

export default Page;
