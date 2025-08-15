import { IcCloseCircle, IcDown, IcUp } from '@svg';
import { useEffect, useState } from 'react';
import { getPracticeTest } from '@apis';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';

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
    <div className='relative h-[5.6rem] w-full'>
      <div
        className={`border-lightgray500 rounded-400 absolute z-30 min-h-[5.6rem] w-full border bg-white px-400 py-200`}>
        <div className='flex min-h-[4rem] items-center justify-between gap-[0.9rem]'>
          {practiceTest ? (
            <div className='font-bold-18 w-full cursor-pointer' onClick={toggleOpen}>
              {practiceTestName}
            </div>
          ) : (
            <input
              {...register('search')}
              className='font-bold-18 w-full outline-none'
              placeholder={'입력해주세요'}
              onFocus={() => setIsOpen(true)}
            />
          )}

          <div className='flex items-center gap-200'>
            {practiceTest && (
              <div onClick={(e) => handleSelectPracticeTest(e, undefined)}>
                <IcCloseCircle width={24} height={24} className='cursor-pointer' />
              </div>
            )}
            {isOpen ? (
              <IcUp className='cursor-pointer' width={24} height={24} onClick={toggleOpen} />
            ) : (
              <IcDown className='cursor-pointer' width={24} height={24} onClick={toggleOpen} />
            )}
          </div>
        </div>
        {isOpen && (
          <>
            <div className='bg-lightgray500 my-[1rem] h-[1px] w-full' />
            <div>
              <div className='flex flex-col gap-300'>
                {filteredResult?.map((exam) => (
                  <div
                    key={exam.id}
                    className='font-medium-14 cursor-pointer text-black'
                    onClick={(e) => handleSelectPracticeTest(e, exam.id)}>
                    {exam?.displayName}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeTestSelect;
