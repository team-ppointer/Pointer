import { ComponentWithLabel, Input, SegmentedControl } from '@components';
import type { ProblemType } from '@types';
import { forwardRef, useState } from 'react';
import { Tag, FileText, Info, ChevronDown, AlertCircle, Files } from 'lucide-react';

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
  MAIN_PROBLEM: '메인 문제',
  CHILD_PROBLEM: '새끼 문제',
};

const ProblemTypeIcon = {
  MAIN_PROBLEM: FileText,
  CHILD_PROBLEM: Files,
};

const ProblemTypeList: ProblemType[] = Object.keys(ProblemTypeName) as ProblemType[];

const ProblemEssentialInput = ({ children }: { children: React.ReactNode }) => {
  return <div className='space-y-4'>{children}</div>;
};

const ProblemTypeSection = ({ problemType, handleChangeType }: ProblemTypeSectionProps) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30'>
          <Tag className='h-4 w-4 text-white' />
        </div>
        <h3 className='text-lg font-bold text-gray-900'>문제 유형</h3>
      </div>
      <div className='flex flex-wrap gap-3'>
        {ProblemTypeList.map((type) => (
          <button
            key={type}
            type='button'
            onClick={() => handleChangeType(type)}
            className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
              problemType === type
                ? 'scale-[1.02] bg-gradient-to-r from-[var(--color-main)] to-[var(--color-main)]/90 text-white shadow-[var(--color-main)]/30 shadow-lg'
                : 'border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
            }`}>
            {ProblemTypeName[type]}
          </button>
        ))}
      </div>
    </div>
  );
};

const PracticeTestSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'>
          <FileText className='h-4 w-4 text-white' />
        </div>
        <h3 className='text-lg font-bold text-gray-900'>모의고사 정보</h3>
      </div>
      <div className='flex flex-wrap items-start gap-4'>{children}</div>
    </div>
  );
};

const PracticeTest = ({ practiceTest, handlePracticeTest }: PracticeTestProps) => {
  return (
    <ComponentWithLabel label='메인 문제 모의고사 '>
      <PracticeTestSelect practiceTest={practiceTest} handlePracticeTest={handlePracticeTest} />
    </ComponentWithLabel>
  );
};

const PraticeTestNumber = forwardRef<HTMLInputElement>(({ ...props }, ref) => {
  return (
    <div className='flex'>
      <ComponentWithLabel label='메인 문제 번호 입력'>
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
  return (
    isError && (
      <div className='flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3'>
        <AlertCircle className='h-5 w-5 flex-shrink-0 text-red-600' />
        <p className='text-sm font-semibold text-red-700'>{errorMessage}</p>
      </div>
    )
  );
};

const ProblemID = forwardRef<HTMLInputElement>(({ ...props }, ref) => {
  const [isTableVisible, setIsTableVisible] = useState(false);

  const toggleTable = () => {
    setIsTableVisible(!isTableVisible);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <ComponentWithLabel label='문제 ID' labelWidth='4rem'>
          <Input ref={ref} placeholder={'입력해주세요'} {...props} />
        </ComponentWithLabel>
        <button
          type='button'
          onClick={toggleTable}
          className='group flex flex-shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-100'>
          <Info className='text-main group-hover:text-main h-5 w-5 transition-colors' />
          문제 ID 입력 가이드
          <ChevronDown
            className={`ml-auto h-4 w-4 transition-transform duration-300 ${
              isTableVisible ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
      {isTableVisible && (
        <div className='animate-in fade-in slide-in-from-top-2 ml-20 overflow-hidden rounded-2xl border border-gray-200 bg-white duration-300'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='border-r border-b-2 border-gray-200 px-4 py-3 text-left font-bold text-gray-900'>
                  학년
                </th>
                <th className='border-r border-b-2 border-gray-200 px-4 py-3 text-left font-bold text-gray-900'>
                  문제 ID
                </th>
                <th className='w-16 border-r border-b-2 border-gray-200 px-3 py-3 text-center font-bold text-gray-900'>
                  1
                </th>
                <th className='w-16 border-r border-b-2 border-gray-200 px-3 py-3 text-center font-bold text-gray-900'>
                  2
                </th>
                <th className='w-16 border-r border-b-2 border-gray-200 px-3 py-3 text-center font-bold text-gray-900'>
                  3
                </th>
                <th className='w-16 border-r border-b-2 border-gray-200 px-3 py-3 text-center font-bold text-gray-900'>
                  4
                </th>
                <th className='w-16 border-r border-b-2 border-gray-200 px-3 py-3 text-center font-bold text-gray-900'>
                  5
                </th>
                <th className='w-16 border-r border-b-2 border-gray-200 px-3 py-3 text-center font-bold text-gray-900'>
                  6
                </th>
                <th className='w-16 border-r border-b-2 border-gray-200 px-3 py-3 text-center font-bold text-gray-900'>
                  7
                </th>
                <th className='w-16 border-b-2 border-gray-200 px-3 py-3 text-center font-bold text-gray-900'>
                  8
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className='transition-colors hover:bg-blue-50/50'>
                <td className='border-r border-b border-gray-200 px-4 py-3 font-medium text-gray-800'>
                  고1
                </td>
                <td className='border-r border-b border-gray-200 px-4 py-3 font-mono font-semibold tracking-wider text-blue-600'>
                  11YYMMNN
                </td>
                <td className='border-r border-b border-gray-200 px-3 py-3 text-center text-gray-700'>
                  1
                </td>
                <td className='border-r border-b border-gray-200 px-3 py-3 text-center text-gray-700'>
                  1
                </td>
                <td
                  colSpan={2}
                  className='border-r border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  연도
                </td>
                <td
                  colSpan={2}
                  className='border-r border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  월
                </td>
                <td
                  colSpan={2}
                  className='border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  문제 번호
                </td>
              </tr>
              <tr className='transition-colors hover:bg-blue-50/50'>
                <td className='border-r border-b border-gray-200 px-4 py-3 font-medium text-gray-800'>
                  고2
                </td>
                <td className='border-r border-b border-gray-200 px-4 py-3 font-mono font-semibold tracking-wider text-blue-600'>
                  12YYMMNN
                </td>
                <td className='border-r border-b border-gray-200 px-3 py-3 text-center text-gray-700'>
                  1
                </td>
                <td className='border-r border-b border-gray-200 px-3 py-3 text-center text-gray-700'>
                  2
                </td>
                <td
                  colSpan={2}
                  className='border-r border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  연도
                </td>
                <td
                  colSpan={2}
                  className='border-r border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  월
                </td>
                <td
                  colSpan={2}
                  className='border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  문제 번호
                </td>
              </tr>
              <tr className='transition-colors hover:bg-blue-50/50'>
                <td className='border-r border-b border-gray-200 px-4 py-3 font-medium text-gray-800'>
                  고3(가형)(B형)
                </td>
                <td className='border-r border-b border-gray-200 px-4 py-3 font-mono font-semibold tracking-wider text-blue-600'>
                  13YYMMNN
                </td>
                <td className='border-r border-b border-gray-200 px-3 py-3 text-center text-gray-700'>
                  1
                </td>
                <td className='border-r border-b border-gray-200 px-3 py-3 text-center text-gray-700'>
                  3
                </td>
                <td
                  colSpan={2}
                  className='border-r border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  연도
                </td>
                <td
                  colSpan={2}
                  className='border-r border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  월
                </td>
                <td
                  colSpan={2}
                  className='border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  문제 번호
                </td>
              </tr>
              <tr className='transition-colors hover:bg-blue-50/50'>
                <td className='border-r border-b border-gray-200 px-4 py-3 font-medium text-gray-800'>
                  고3(나형)(A형)
                </td>
                <td className='border-r border-b border-gray-200 px-4 py-3 font-mono font-semibold tracking-wider text-blue-600'>
                  14YYMMNN
                </td>
                <td className='border-r border-b border-gray-200 px-3 py-3 text-center text-gray-700'>
                  1
                </td>
                <td className='border-r border-b border-gray-200 px-3 py-3 text-center text-gray-700'>
                  4
                </td>
                <td
                  colSpan={2}
                  className='border-r border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  연도
                </td>
                <td
                  colSpan={2}
                  className='border-r border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  월
                </td>
                <td
                  colSpan={2}
                  className='border-b border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  문제 번호
                </td>
              </tr>
              <tr className='transition-colors hover:bg-blue-50/50'>
                <td className='border-r border-gray-200 px-4 py-3 font-medium text-gray-800'>
                  변형
                </td>
                <td className='border-r border-gray-200 px-4 py-3 font-mono font-semibold tracking-wider text-blue-600'>
                  2GYYMMNN
                </td>
                <td className='border-r border-gray-200 px-3 py-3 text-center text-gray-700'>2</td>
                <td className='border-r border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  학년
                </td>
                <td
                  colSpan={2}
                  className='border-r border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  연도
                </td>
                <td
                  colSpan={2}
                  className='border-r border-gray-200 px-3 py-3 text-center font-medium text-gray-700'>
                  월
                </td>
                <td colSpan={2} className='px-3 py-3 text-center font-medium text-gray-700'>
                  문제 번호
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

const ProblemTitle = forwardRef<HTMLInputElement>(({ ...props }, ref) => {
  return (
    <div className='flex items-center gap-2'>
      <ComponentWithLabel label='문제 제목' labelWidth='4rem'>
        <Input ref={ref} placeholder={'제목을 입력해주세요'} {...props} />
      </ComponentWithLabel>
    </div>
  );
});

interface ProblemTypeProps {
  enabled: boolean;
  defaultValue?: ProblemType;
  value?: ProblemType;
  onChange?: (type: ProblemType) => void;
}

const ProblemType = ({ enabled, defaultValue, value, onChange }: ProblemTypeProps) => {
  return (
    <div className='flex items-center gap-2'>
      <ComponentWithLabel label='문제 유형' labelWidth='4rem'>
        <SegmentedControl
          items={ProblemTypeList.map((type) => ({
            label: ProblemTypeName[type],
            value: type,
            icon: ProblemTypeIcon[type],
          }))}
          enabled={enabled}
          defaultValue={defaultValue}
          value={value}
          onChange={(nextType) => onChange?.(nextType as ProblemType)}
        />
      </ComponentWithLabel>
    </div>
  );
};

ProblemEssentialInput.ProblemTypeSection = ProblemTypeSection;
ProblemEssentialInput.PracticeTestSection = PracticeTestSection;
ProblemEssentialInput.PracticeTest = PracticeTest;
ProblemEssentialInput.PraticeTestNumber = PraticeTestNumber;
ProblemEssentialInput.ProblemError = ProblemError;
ProblemEssentialInput.ProblemID = ProblemID;
ProblemEssentialInput.ProblemTitle = ProblemTitle;
ProblemEssentialInput.ProblemType = ProblemType;

export default ProblemEssentialInput;
