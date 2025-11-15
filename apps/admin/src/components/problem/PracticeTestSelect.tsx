import { useEffect, useState } from 'react';
import { getPracticeTest } from '@apis';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';
import { ChevronDown, ChevronUp, X, Search } from 'lucide-react';

interface PracticeTestSelectProps {
  practiceTest: number | undefined;
  handlePracticeTest: (exam: number | undefined) => void;
}

const PracticeTestSelect = ({ practiceTest, handlePracticeTest }: PracticeTestSelectProps) => {
  const { data: practiceTestList } = getPracticeTest();

  const [isOpen, setIsOpen] = useState(false);
  const [filteredResult, setFilteredResult] = useState(practiceTestList?.data);

  const { register, watch, setValue } = useForm({ defaultValues: { search: '' } });
  const searchValue = watch('search');

  const practiceTestName = practiceTestList?.data.find(
    (exam) => exam.id === practiceTest
  )?.displayName;

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const debouncedFilter = debounce((value) => {
      setFilteredResult(practiceTestList?.data.filter((exam) => exam?.displayName.includes(value)));
    }, 300);

    debouncedFilter(searchValue);

    return () => debouncedFilter.cancel();
  }, [searchValue, practiceTestList]);

  const handleSelectPracticeTest = (
    e: React.MouseEvent<HTMLDivElement>,
    examId: number | undefined
  ) => {
    e.stopPropagation();
    handlePracticeTest(examId);
    setValue('search', '');
    setIsOpen(false);
  };

  return (
    <div className='relative w-full'>
      <div
        className={`group relative z-30 w-full rounded-xl border-2 bg-white transition-all duration-200 ${
          isOpen
            ? 'border-blue-400 shadow-lg shadow-blue-100'
            : 'border-gray-200 hover:border-gray-300'
        }`}>
        <div className='flex min-h-[48px] items-center justify-between gap-3 px-4 py-2.5'>
          {practiceTest ? (
            <div
              className='w-full cursor-pointer text-base font-semibold text-gray-900'
              onClick={toggleOpen}>
              {practiceTestName}
            </div>
          ) : (
            <div className='relative flex w-full items-center gap-2'>
              <Search className='h-4 w-4 text-gray-400' />
              <input
                {...register('search')}
                className='w-full text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none'
                placeholder='모의고사 검색...'
                onFocus={() => setIsOpen(true)}
              />
            </div>
          )}

          <div className='flex items-center gap-2'>
            {practiceTest && (
              <button
                type='button'
                onClick={(e) => handleSelectPracticeTest(e, undefined)}
                className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
                <X className='h-4 w-4' />
              </button>
            )}
            <button
              type='button'
              onClick={toggleOpen}
              className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
              {isOpen ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className='animate-in fade-in slide-in-from-top-2 border-t border-gray-100 duration-200'>
            <div className='max-h-60 overflow-y-auto p-2'>
              {filteredResult && filteredResult.length > 0 ? (
                <div className='flex flex-col gap-1'>
                  {filteredResult.map((exam) => (
                    <div
                      key={exam.id}
                      className='cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900'
                      onClick={(e) => handleSelectPracticeTest(e, exam.id)}>
                      {exam?.displayName}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='px-3 py-6 text-center text-sm text-gray-400'>
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeTestSelect;
