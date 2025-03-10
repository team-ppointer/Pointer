import { Button, SmallButton, SolveButton, Tag } from '@components';

import { IcSolve } from '@/assets/svg';

export default function Home() {
  return (
    <div className='flex w-[40rem] flex-col gap-2'>
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

      <Tag variant='green'>완료</Tag>
      <Tag variant='red'>진행중</Tag>
      <Tag variant='gray'>시작전</Tag>
      <Tag variant='green' sizeType='small'>
        정답
      </Tag>
      <Tag variant='red' sizeType='small'>
        오답
      </Tag>
      <Tag variant='gray' sizeType='small'>
        미완료
      </Tag>
    </div>
  );
}
