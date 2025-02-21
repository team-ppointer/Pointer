import { Button, ComponentWithLabel, Input, PracticeTestSelect, SectionCard } from '@components';
import { ProblemType } from '@types';
import { forwardRef } from 'react';

interface ProblemTypeSectionProps {
  problemType: ProblemType;
  handleChangeType: (type: ProblemType) => void;
}

interface PracticeTestProps {
  practiceTest: number | undefined;
  handlePracticeTest: (exam: number | undefined) => void;
}

const ProblemTypeName = {
  GICHUL_PROBLEM: '기출 문제',
  VARIANT_PROBLEM: '변형 문제',
  CREATION_PROBLEM: '창작 문제',
};

const ProblemTypeList: ProblemType[] = Object.keys(ProblemTypeName) as ProblemType[];

const ProblemEssentialInput = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='mt-[4.8rem]'>
      <SectionCard>{children}</SectionCard>
    </div>
  );
};

const ProblemTypeSection = ({ problemType, handleChangeType }: ProblemTypeSectionProps) => {
  return (
    <div className='flex items-center justify-between'>
      <h3 className='font-bold-32'>필수 입력 항목</h3>
      <div className='flex items-center gap-[0.8rem]'>
        {ProblemTypeList.map((type) => (
          <Button
            key={type}
            type='button'
            variant={problemType === type ? 'light' : 'dimmed'}
            onClick={() => handleChangeType(type)}>
            {ProblemTypeName[type]}
          </Button>
        ))}
      </div>
    </div>
  );
};

const PracticeTestSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='mt-[3.2rem]'>
      <div className='flex h-fit w-full items-center gap-[4.8rem]'>{children}</div>
    </div>
  );
};

const PracticeTest = ({ practiceTest, handlePracticeTest }: PracticeTestProps) => {
  return (
    <ComponentWithLabel label='메인 문항 모의고사 '>
      <PracticeTestSelect practiceTest={practiceTest} handlePracticeTest={handlePracticeTest} />
    </ComponentWithLabel>
  );
};

const PraticeTestNumber = forwardRef<HTMLInputElement>(({ ...props }, ref) => {
  return (
    <ComponentWithLabel label='메인 문항 번호 입력'>
      <Input ref={ref} placeholder={'입력해주세요'} {...props} />
    </ComponentWithLabel>
  );
});
interface ProblemErrorProps {
  isError: boolean;
  errorMessage: string;
}

const ProblemError = ({ isError, errorMessage }: ProblemErrorProps) => {
  return isError && <p className='text-red font-medium-18 mt-[2rem]'>{errorMessage}</p>;
};

ProblemEssentialInput.ProblemTypeSection = ProblemTypeSection;
ProblemEssentialInput.PracticeTestSection = PracticeTestSection;
ProblemEssentialInput.PracticeTest = PracticeTest;
ProblemEssentialInput.PraticeTestNumber = PraticeTestNumber;
ProblemEssentialInput.ProblemError = ProblemError;

export default ProblemEssentialInput;
