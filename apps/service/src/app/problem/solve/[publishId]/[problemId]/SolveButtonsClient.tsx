'use client';
import { SolveButton } from '@components';
import { getChildData, postChildProblemSubmit, postProblemSubmit } from '@apis';
import { useRouter } from 'next/navigation';

interface SolveButtonsClientProps {
  publishId: string;
  problemId: string;
}

const SolveButtonsClient = ({ publishId, problemId }: SolveButtonsClientProps) => {
  const router = useRouter();
  const { data } = getChildData(publishId, problemId);
  const childProblemId = data?.data?.childProblemIds[0].toString();

  const handleClickDirect = async () => {
    await postProblemSubmit(publishId, problemId);
    router.push(`/problem/solve/${publishId}/${problemId}/main-problem`);
  };

  const handleClickStep = async () => {
    await postChildProblemSubmit(publishId, problemId);
    router.push(`/problem/solve/${publishId}/${problemId}/child-problem/${childProblemId}`);
  };

  return (
    <div className='mt-[2rem] flex flex-col gap-[1.6rem] sm:flex-row'>
      <SolveButton variant='direct' onClick={handleClickDirect} />
      <SolveButton variant='step' onClick={handleClickStep} />
    </div>
  );
};

export default SolveButtonsClient;
