'use client';
import { SolveButton } from '@components';
import { postChildProblemSubmit, postProblemSubmit } from '@apis';
import { useRouter } from 'next/navigation';

interface SolveButtonsClientProps {
  publishId: string;
  problemId: string;
}

const SolveButtonsClient = ({ publishId, problemId }: SolveButtonsClientProps) => {
  const router = useRouter();

  const handleClickDirect = async () => {
    await postProblemSubmit(publishId, problemId);
    router.push(`/problem/solve/${publishId}/${problemId}/main-problem`);
  };

  const handleClickStep = async () => {
    await postChildProblemSubmit(publishId, problemId);
    // router.push(`/problem/solve/${publishId}/${problemId}/child-problem`);
  };

  return (
    <div className='mt-[2rem] flex flex-col gap-[1.6rem] sm:flex-row'>
      <SolveButton variant='direct' onClick={handleClickDirect} />
      <SolveButton variant='step' onClick={handleClickStep} />
    </div>
  );
};

export default SolveButtonsClient;
