import { Button, SmallButton, SolveButton } from '@components';

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
      <SmallButton>해설 보기</SmallButton>
      <SmallButton sizeType='small'>해설 보기</SmallButton>
      <SmallButton variant='underline'>btn</SmallButton>
      <SmallButton variant='underline' sizeType='small'>
        btn
      </SmallButton>
      <SmallButton variant='disabled'>해설 보기</SmallButton>
    </div>
  );
}
