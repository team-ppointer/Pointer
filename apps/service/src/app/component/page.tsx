'use client';
import { useState } from 'react';
import {
  Button,
  SmallButton,
  SolveButton,
  Tag,
  NavigationButton,
  CopyButton,
  TimeTag,
  ProgressBox,
  AnswerInput,
  StatusTag,
  StatusIcon,
} from '@components';
import { IcSolve } from '@svg';

import { GuideButton } from '@/components/home';
import { TabMenu } from '@/components/report';

const Page = () => {
  const [selectedTab, setSelectedTab] = useState<'분석' | '손해설'>('분석');

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
      <TabMenu
        leftMenu='분석'
        rightMenu='손해설'
        selectedTab={selectedTab}
        onTabChange={(tab) => setSelectedTab(tab)}
      />
      <div className='flex gap-[1.6rem]'>
        <NavigationButton variant='prev' label='이전' onClick={() => {}} />
        <NavigationButton variant='next' label='다음' onClick={() => {}} />
      </div>

      <CopyButton onClick={() => {}} />
      <TimeTag minutes={1} seconds={30} />

      <div className='flex gap-[0.4rem]'>
        <ProgressBox progress='notStarted' />
        <ProgressBox progress='inProgress' />
        <ProgressBox progress='completed' />
      </div>
      <GuideButton />
      <AnswerInput answerType='SHORT_ANSWER' selectedAnswer='1' />

      <StatusTag status='correct' />
      <StatusTag status='incorrect' />
      <StatusTag status='retried' />
      <StatusTag status='inProgress' />
      <StatusTag status='notStarted' />

      <div className='flex gap-[0.4rem]'>
        <StatusIcon status='correct' />
        <StatusIcon status='incorrect' />
        <StatusIcon status='retried' />
        <StatusIcon status='notStarted' />
      </div>
    </div>
  );
};

export default Page;
