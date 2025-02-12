import { Button, Header, ProblemEssentialInput } from '@components';
import { createFileRoute } from '@tanstack/react-router';
import { ExamType, ProblemTypeType } from '@types';
import { useState } from 'react';

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [problemType, setProblemType] = useState<ProblemTypeType>('기출 문제');
  const [practiceTest, setPracticeTest] = useState<ExamType | null>(null);
  const [practiceTestNumber, setPracticeTestNumber] = useState<number>();

  const handleChangeType = (type: ProblemTypeType) => {
    setProblemType(type);
  };

  const handlePracticeTest = (exam: ExamType | null) => {
    setPracticeTest(exam);
  };

  const handleChangeNumber = (num: number) => {
    setPracticeTestNumber(num);
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
      <ProblemEssentialInput
        problemType={problemType}
        practiceTest={practiceTest}
        practiceTestNumber={practiceTestNumber}
        handleChangeType={handleChangeType}
        handlePracticeTest={handlePracticeTest}
        handleChangeNumber={handleChangeNumber}
      />
      <div className='mt-[2.4rem] flex w-full items-center justify-end'>
        <Button type='button' sizeType='long' variant='dark' onClick={handleClickRegister}>
          완료
        </Button>
      </div>
    </>
  );
}
