import { useEffect, useState, useRef } from 'react';
import { getPracticeTest } from '@apis';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';
import { ChevronDown, Search, Plus } from 'lucide-react';

interface PracticeTestSelectProps {
  practiceTest: number | undefined;
  handlePracticeTest: (exam: number | undefined) => void;
  onCreateNew?: () => void;
}

const PracticeTestSelect = ({
  practiceTest,
  handlePracticeTest,
  onCreateNew,
}: PracticeTestSelectProps) => {
  const { data: practiceTestList } = getPracticeTest();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [filteredResult, setFilteredResult] = useState(practiceTestList?.data);

  const { register, watch, setValue } = useForm({ defaultValues: { search: '' } });
  const searchValue = watch('search');

  const selectedPracticeTest = practiceTestList?.data.find((exam) => exam.id === practiceTest);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPracticeTest = (
    e: React.MouseEvent<HTMLButtonElement>,
    examId: number | undefined
  ) => {
    e.stopPropagation();
    handlePracticeTest(examId);
    setValue('search', '');
    setIsOpen(false);
  };

  // const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.stopPropagation();
  //   handlePracticeTest(undefined);
  //   setValue('search', '');
  // };

  return (
    <div className='relative w-full' ref={containerRef}>
      {/* Main Select Button */}
      <button
        type='button'
        onClick={toggleOpen}
        className={`group relative w-full rounded-xl border bg-white transition-all duration-200 ${
          isOpen
            ? 'border-[var(--color-main)] shadow-[var(--color-main)]/10'
            : 'border-gray-200 hover:border-gray-300'
        }`}>
        <div className='flex min-h-[48px] items-center justify-between gap-3 px-4 py-2.5'>
          {selectedPracticeTest ? (
            <div className='flex items-center gap-3'>
              <div className='text-left'>
                <p className='text-sm font-semibold text-gray-900'>
                  {selectedPracticeTest.displayName}
                </p>
                {/* <p className='text-xs text-gray-500'>
                  {selectedPracticeTest.year}년 {selectedPracticeTest.month}월 ·{' '}
                  {selectedPracticeTest.grade}학년
                </p> */}
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-2 text-gray-400'>
              <Search className='h-4 w-4' />
              <span className='text-sm font-medium'>모의고사를 선택해주세요</span>
            </div>
          )}

          <div className='flex items-center gap-1'>
            {/* {selectedPracticeTest && (
              <button
                type='button'
                onClick={handleClear}
                className='rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600'>
                <X className='h-4 w-4' />
              </button>
            )} */}
            <div
              className={`rounded-lg p-1.5 text-gray-400 transition-all ${isOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className='h-4 w-4' />
            </div>
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className='animate-in fade-in slide-in-from-top-2 absolute z-50 mt-2 w-full duration-200'>
          <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl'>
            {/* Search Input */}
            <div className='border-b border-gray-100'>
              <div className='flex items-center gap-2 p-4'>
                <Search className='h-4 w-4 text-gray-400' />
                <input
                  {...register('search')}
                  className='w-full bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none'
                  placeholder='모의고사 검색...'
                  autoFocus
                />
              </div>
            </div>

            {/* Options List */}
            <div className='max-h-64 overflow-y-auto p-2'>
              {filteredResult && filteredResult.length > 0 ? (
                <div className='flex flex-col gap-1'>
                  {filteredResult.map((exam) => (
                    <button
                      key={exam.id}
                      type='button'
                      onClick={(e) => handleSelectPracticeTest(e, exam.id)}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                        practiceTest === exam.id
                          ? 'bg-[var(--color-main)]/10 text-[var(--color-main)]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}>
                      {/* <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          practiceTest === exam.id
                            ? 'bg-[var(--color-main)] text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }`}>
                        <Calendar className='h-4 w-4' />
                      </div> */}
                      <div className='flex-1 overflow-hidden'>
                        <p
                          className={`truncate text-sm font-semibold ${
                            practiceTest === exam.id ? 'text-[var(--color-main)]' : 'text-gray-900'
                          }`}>
                          {exam.displayName}
                        </p>
                        {/* <p className='text-xs text-gray-500'>
                          {exam.year}년 {exam.month}월 · {exam.grade}학년
                        </p> */}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className='px-3 py-8 text-center'>
                  <Search className='mx-auto h-8 w-8 text-gray-300' />
                  <p className='mt-2 text-sm font-medium text-gray-500'>검색 결과가 없습니다</p>
                </div>
              )}
            </div>

            {/* Create New Button */}
            {onCreateNew && (
              <div className='border-t border-gray-100 p-2'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNew();
                    setIsOpen(false);
                  }}
                  className='flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--color-main)] transition-all hover:bg-[var(--color-main)]/10'>
                  <Plus className='h-4 w-4' />새 모의고사 추가
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeTestSelect;
