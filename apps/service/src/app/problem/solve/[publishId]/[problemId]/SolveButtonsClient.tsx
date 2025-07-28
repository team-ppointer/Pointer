'use client';
import { useRouter } from 'next/navigation';

import { SolveButton } from '@components';
import { postProblemSubmit, useGetChildProblemById } from '@apis';
import { useInvalidate } from '@hooks';
import { trackEvent } from '@utils';

interface SolveButtonsClientProps {
  publishId: string;
  problemId: string;
}

const SolveButtonsClient = ({ publishId, problemId }: SolveButtonsClientProps) => {
  const router = useRouter();
  const { invalidateAll } = useInvalidate();
  const childData = useGetChildProblemById(+publishId, +problemId);
  const childProblemId = childData.data?.id;

  const handleClickDirect = async () => {
    trackEvent('problem_solve_direct_button_click');
    invalidateAll();
    //CHECK: postProblemSubmit의 파라미터가 맞는지 확인
    router.push(`/problem/solve/${publishId}/${problemId}/main-problem`);
  };

  const handleClickStep = async () => {
    trackEvent('problem_solve_step_button_click');
    await postProblemSubmit(+publishId, +problemId, null, 0);
    invalidateAll();
    router.push(`/problem/solve/${publishId}/${problemId}/child-problem/${childProblemId}`);
  };

  return (
    <div className='mt-[2rem] flex flex-col gap-[1.6rem] sm:flex-row'>
      <SolveButton variant='direct' onClick={handleClickDirect} />
      {childProblemId && <SolveButton variant='step' onClick={handleClickStep} />}
    </div>
  );
};

export default SolveButtonsClient;
