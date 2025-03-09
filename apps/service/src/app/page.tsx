import { Button, SolveButton } from '@components';

import { IcSolve } from '@/assets/svg';

export default function Home() {
  return (
    <div className='w-[40rem]'>
      <Button>
        <IcSolve width={24} height={24} />
        오늘 문제 풀기
      </Button>
      <SolveButton variant='direct' />
      <SolveButton variant='step' />
    </div>
  );
}
