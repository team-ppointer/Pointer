import { Button, ComponentWithLabel, Input, SectionCard } from '@components';
import { ProblemType } from '@types';
import { forwardRef, useState } from 'react';

import PracticeTestSelect from './PracticeTestSelect';

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
    <div className='mt-1200'>
      <SectionCard>{children}</SectionCard>
    </div>
  );
};

const ProblemTypeSection = ({ problemType, handleChangeType }: ProblemTypeSectionProps) => {
  return (
    <div className='flex items-center justify-between'>
      <h3 className='font-bold-32'>필수 입력 항목</h3>
      <div className='flex items-center gap-200'>
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
    <div className='mt-800'>
      <div className='flex h-fit w-full items-center gap-1200'>{children}</div>
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
    <div className='flex'>
      <ComponentWithLabel label='메인 문항 번호 입력'>
        <Input ref={ref} placeholder={'입력해주세요'} {...props} />
      </ComponentWithLabel>
    </div>
  );
});

interface ProblemErrorProps {
  isError: boolean;
  errorMessage: string;
}

const ProblemError = ({ isError, errorMessage }: ProblemErrorProps) => {
  return isError && <p className='text-red font-medium-18 mt-[2rem]'>{errorMessage}</p>;
};

const ProblemID = forwardRef<HTMLInputElement>(({ ...props }, ref) => {
  const [isTableVisible, setIsTableVisible] = useState(false);

  const toggleTable = () => {
    setIsTableVisible(!isTableVisible);
  };

  return (
    <div className='mt-600 flex flex-col'>
      <ComponentWithLabel label='문제 ID'>
        <Input ref={ref} placeholder={'입력해주세요'} {...props} />
      </ComponentWithLabel>
      <button
        type='button'
        onClick={toggleTable}
        className='font-bold-18 mt-600 flex cursor-pointer items-center gap-200 text-black transition-colors hover:text-gray-700'>
        ⓘ 문제 ID 입력 가이드
        <svg
          className={`h-[1.6rem] w-[1.6rem] transition-transform duration-200 ${
            isTableVisible ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </button>
      {isTableVisible && (
        <table className='font-medium-16 rounded-400 mt-400 border-collapse overflow-hidden border border-gray-500'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='font-semibold-16 border border-gray-300 px-400 py-300 text-left text-gray-900'>
                학년
              </th>
              <th className='font-semibold-16 border border-gray-300 px-400 py-300 text-left text-gray-900'>
                문제 ID
              </th>
              <th className='font-semibold-16 w-[7rem] border border-gray-300 px-400 py-300 text-center text-gray-900'>
                1
              </th>
              <th className='font-semibold-16 w-[7rem] border border-gray-300 px-400 py-300 text-center text-gray-900'>
                2
              </th>
              <th className='font-semibold-16 w-[7rem] border border-gray-300 px-400 py-300 text-center text-gray-900'>
                3
              </th>
              <th className='font-semibold-16 w-[7rem] border border-gray-300 px-400 py-300 text-center text-gray-900'>
                4
              </th>
              <th className='font-semibold-16 w-[7rem] border border-gray-300 px-400 py-300 text-center text-gray-900'>
                5
              </th>
              <th className='font-semibold-16 w-[7rem] border border-gray-300 px-400 py-300 text-center text-gray-900'>
                6
              </th>
              <th className='font-semibold-16 w-[7rem] border border-gray-300 px-400 py-300 text-center text-gray-900'>
                7
              </th>
              <th className='font-semibold-16 w-[7rem] border border-gray-300 px-400 py-300 text-center text-gray-900'>
                8
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className='hover:bg-gray-25 transition-colors'>
              <td className='border border-gray-300 px-400 py-300 text-gray-800'>고1</td>
              <td className='text-blue border border-gray-300 px-400 py-300 font-mono tracking-wider'>
                11YYMMNN
              </td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>1</td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>1</td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                연도
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                월
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                문제 번호
              </td>
            </tr>
            <tr className='hover:bg-gray-25 transition-colors'>
              <td className='border border-gray-300 px-400 py-300 text-gray-800'>고2</td>
              <td className='text-blue border border-gray-300 px-400 py-300 font-mono tracking-wider'>
                12YYMMNN
              </td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>1</td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>2</td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                연도
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                월
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                문제 번호
              </td>
            </tr>
            <tr className='hover:bg-gray-25 transition-colors'>
              <td className='border border-gray-300 px-400 py-300 text-gray-800'>고3(가형)(B형)</td>
              <td className='text-blue border border-gray-300 px-400 py-300 font-mono tracking-wider'>
                13YYMMNN
              </td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>1</td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>3</td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                연도
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                월
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                문제 번호
              </td>
            </tr>
            <tr className='hover:bg-gray-25 transition-colors'>
              <td className='border border-gray-300 px-400 py-300 text-gray-800'>고3(나형)(A형)</td>
              <td className='text-blue border border-gray-300 px-400 py-300 font-mono tracking-wider'>
                14YYMMNN
              </td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>1</td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>4</td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                연도
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                월
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                문제 번호
              </td>
            </tr>
            <tr className='hover:bg-gray-25 transition-colors'>
              <td className='border border-gray-300 px-400 py-300 text-gray-800'>변형</td>
              <td className='text-blue border border-gray-300 px-400 py-300 font-mono tracking-wider'>
                2GYYMMNN
              </td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>2</td>
              <td className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                학년
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                연도
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                월
              </td>
              <td
                colSpan={2}
                className='border border-gray-300 px-400 py-300 text-center text-gray-700'>
                문제 번호
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
});

ProblemEssentialInput.ProblemTypeSection = ProblemTypeSection;
ProblemEssentialInput.PracticeTestSection = PracticeTestSection;
ProblemEssentialInput.PracticeTest = PracticeTest;
ProblemEssentialInput.PraticeTestNumber = PraticeTestNumber;
ProblemEssentialInput.ProblemError = ProblemError;
ProblemEssentialInput.ProblemID = ProblemID;

export default ProblemEssentialInput;
