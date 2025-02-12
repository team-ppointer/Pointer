import { IcCloseCircle, IcDown, IcUp } from '@svg';
import { useEffect, useState } from 'react';
import { Input } from '@components';
import { getPracticeTestTags } from '@apis';
import { ExamType } from '@types';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';

interface PracticeTestSelectProps {
  selectedPracticeTest: ExamType | null;
  handleSelectPracticeTest: (exam: ExamType | null) => void;
}

const PracticeTestSelect = ({
  selectedPracticeTest,
  handleSelectPracticeTest,
}: PracticeTestSelectProps) => {
  const { data: practiceTestList } = getPracticeTestTags();

  const [isOpen, setIsOpen] = useState(false);
  const [filteredResult, setFilteredResult] = useState(practiceTestList as ExamType[]);

  const { register, watch } = useForm({ defaultValues: { search: '' } });
  const searchValue = watch('search');

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleClickSelect = (e: React.MouseEvent<HTMLDivElement>, exam: ExamType) => {
    e.stopPropagation();
    handleSelectPracticeTest(exam);
    setIsOpen(false);
  };

  const handleClickRemove = () => {
    handleSelectPracticeTest(null);
  };

  useEffect(() => {
    const debouncedFilter = debounce((value) => {
      setFilteredResult(
        (practiceTestList as ExamType[])?.filter((exam) => exam.name.includes(value))
      );
    }, 300);

    debouncedFilter(searchValue);

    return () => debouncedFilter.cancel();
  }, [searchValue, practiceTestList]);

  return (
    <div className={`relative ${isOpen && 'z-30'}`}>
      <div className='absolute'>
        <div
          className={`border-lightgray500 min-w-[50rem] rounded-[16px] border bg-white px-[1.6rem] py-[1rem]`}>
          <div className='flex min-h-[3.6rem] cursor-pointer items-start justify-between gap-[0.9rem]'>
            {selectedPracticeTest ? (
              <div className='font-bold-24 w-full'>{selectedPracticeTest.name}</div>
            ) : (
              <Input
                {...register('search')}
                className='font-bold-24 w-full outline-none'
                placeholder='입력해주세요'
                onFocus={() => setIsOpen(true)}
              />
            )}

            <div className='flex items-center gap-[0.8rem]'>
              {selectedPracticeTest && (
                <IcCloseCircle width={24} height={24} onClick={handleClickRemove} />
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
                  {filteredResult?.map((exam: ExamType) => (
                    <div
                      key={exam.id}
                      className='font-medium-14 cursor-pointer text-black'
                      onClick={(e) => handleClickSelect(e, exam)}>
                      {exam.name}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeTestSelect;
