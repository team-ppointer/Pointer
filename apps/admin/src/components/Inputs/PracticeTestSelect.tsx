import { IcCloseCircle, IcDown, IcUp } from '@svg';
import { useEffect, useState } from 'react';
import { getPracticeTestTags } from '@apis';
import { ExamType } from '@types';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';

interface PracticeTestSelectProps {
  practiceTest: ExamType | null;
  handlePracticeTest: (exam: ExamType | null) => void;
}

const PracticeTestSelect = ({ practiceTest, handlePracticeTest }: PracticeTestSelectProps) => {
  const { data: practiceTestList } = getPracticeTestTags();

  const [isOpen, setIsOpen] = useState(false);
  const [filteredResult, setFilteredResult] = useState(practiceTestList);

  const { register, watch } = useForm({ defaultValues: { search: '' } });
  const searchValue = watch('search');

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const debouncedFilter = debounce((value) => {
      setFilteredResult(practiceTestList?.filter((exam) => exam.name.includes(value)));
    }, 300);

    debouncedFilter(searchValue);

    return () => debouncedFilter.cancel();
  }, [searchValue, practiceTestList]);

  const handleSelectPracticeTest = (e: React.MouseEvent<HTMLDivElement>, exam: ExamType | null) => {
    e.stopPropagation();
    handlePracticeTest(exam);
    setIsOpen(false);
  };

  return (
    <div className='h-[5.6rem] w-[70rem]'>
      <div
        className={`border-lightgray500 absolute z-30 min-h-[5.6rem] w-[70rem] rounded-[16px] border bg-white px-[1.6rem] py-[0.8rem]`}>
        <div className='flex justify-between gap-[0.9rem]'>
          {practiceTest ? (
            <div className='font-bold-24 w-full'>{practiceTest.name}</div>
          ) : (
            <input
              {...register('search')}
              className='font-bold-24 w-full outline-none'
              placeholder={'입력해주세요'}
              onFocus={() => setIsOpen(true)}
            />
          )}

          <div className='flex items-center gap-[0.8rem]'>
            {practiceTest && (
              <div onClick={(e) => handleSelectPracticeTest(e, null)}>
                <IcCloseCircle width={24} height={24} />
              </div>
            )}
            {isOpen ? (
              <IcUp className='mt-[0.6rem]' width={24} height={24} onClick={toggleOpen} />
            ) : (
              <IcDown className='mt-[0.6rem]' width={24} height={24} onClick={toggleOpen} />
            )}
          </div>
        </div>
        {isOpen && (
          <>
            <div className='bg-lightgray500 my-[1rem] h-[1px] w-full' />
            <div>
              <div className='flex flex-col gap-[1.2rem]'>
                {filteredResult?.map((exam) => (
                  <div
                    key={exam.id}
                    className='font-medium-14 cursor-pointer text-black'
                    onClick={(e) => handleSelectPracticeTest(e, exam)}>
                    {exam.name}
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
