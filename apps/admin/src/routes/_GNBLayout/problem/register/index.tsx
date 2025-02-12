import { Button, ComponentWithLabel, Header, Input, PracticeTestSelect } from '@components';
import { createFileRoute } from '@tanstack/react-router';
import { ExamType, ProblemTypeType } from '@types';
import { useState } from 'react';

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
});

const ProblemTypeList: ProblemTypeType[] = ['기출 문제', '변형 문제', '창작 문제'];

function RouteComponent() {
  const [problemType, setProblemType] = useState<ProblemTypeType>('기출 문제');
  const [practiceTest, setPracticeTest] = useState<ExamType | null>(null);
  const [practiceTestNumber, setPracticeTestNumber] = useState<number>();

  const handlePracticeTest = (exam: ExamType | null) => {
    setPracticeTest(exam);
  };

  const handleChangeType = (type: ProblemTypeType) => {
    setProblemType(type);

    if (type === '창작 문제') {
      setPracticeTest(null);
      setPracticeTestNumber(undefined);
    }
  };

  const handleClickRegister = () => {
    console.log({
      problemType: problemType,
      practiceTest: practiceTest?.name,
      practiceTestNumber: practiceTestNumber,
    });

    return;
    // mutate({problemType, practiceTest: practiceTest.name, })
  };
  return (
    <>
      <Header title='문항 등록' />
      <section className='border-lightgray500 mt-[4.8rem] w-full rounded-[1.6rem] border bg-white p-[3.2rem]'>
        <div className='flex items-center justify-between'>
          <h3 className='font-bold-32'>필수 입력 항목</h3>
          <div className='flex items-center gap-[0.8rem]'>
            {ProblemTypeList.map((type) => (
              <Button
                type='button'
                variant={problemType === type ? 'light' : 'dimmed'}
                onClick={() => handleChangeType(type)}>
                {type}
              </Button>
            ))}
          </div>
        </div>
        <div className='mt-[3.2rem]'>
          <div className='flex h-fit w-full items-center gap-[4.8rem]'>
            <ComponentWithLabel label='메인 문항 모의고사 '>
              <PracticeTestSelect
                problemType={problemType}
                practiceTest={practiceTest}
                handlePracticeTest={handlePracticeTest}
              />
            </ComponentWithLabel>
            <ComponentWithLabel label='메인 문항 번호 입력'>
              <Input
                type='number'
                placeholder={problemType === '창작 문제' ? '해당 없음' : '입력해주세요'}
                value={practiceTestNumber ? practiceTestNumber.toString() : ''}
                onChange={(e) => {
                  setPracticeTestNumber(Number(e.target.value));
                }}
                disabled={problemType === '창작 문제'}
              />
            </ComponentWithLabel>
            <Button type='button' variant='dark' onClick={handleClickRegister}>
              완료
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
