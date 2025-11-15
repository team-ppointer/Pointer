import { getStudent } from '@apis';
import { Input, Tag } from '@components';
import { components } from '@schema';
import { Search, Users, RotateCcw, UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';

interface Props {
  teacher: components['schemas']['TeacherResp'];
  selectedStudents: components['schemas']['StudentResp'][];
  setSelectedStudents: React.Dispatch<React.SetStateAction<components['schemas']['StudentResp'][]>>;
  onApply: () => void;
}

const StudentSearchModal = ({
  teacher: _teacher,
  selectedStudents,
  setSelectedStudents,
  onApply,
}: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const { data: studentList } = getStudent({ query: '' });
  const { register, watch } = useForm({ defaultValues: { searchInput: '' } });
  const searchInput = watch('searchInput');

  // 검색어 디바운스 처리
  useEffect(() => {
    const debouncedFilter = debounce((value) => {
      setSearchValue(value);
    }, 300);

    debouncedFilter(searchInput);

    return () => debouncedFilter.cancel();
  }, [searchInput]);

  // 검색 필터링된 학생 목록
  const availableStudents =
    studentList?.data
      .filter((student) => !selectedStudents.some((s) => s.id === student.id))
      .filter((student) => student.name.includes(searchValue)) || [];

  // 학생 선택 핸들러
  const handleSelectStudent = (student: components['schemas']['StudentResp']) => {
    setSelectedStudents((prev) => [...prev, student]);
  };

  // 학생 선택 해제 핸들러
  const handleDeselectStudent = (studentId: number) => {
    setSelectedStudents((prev) => prev.filter((student) => student.id !== studentId));
  };

  // 초기화 핸들러
  const handleReset = () => {
    setSelectedStudents([]);
  };

  // 적용 핸들러
  const handleApply = () => {
    onApply();
  };

  return (
    <div className='flex w-[70dvw] max-w-4xl flex-col gap-6 px-8 py-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
          <Users className='h-5 w-5 text-white' />
        </div>
        <h2 className='text-xl font-bold text-gray-900'>담당 학생 검색</h2>
      </div>

      {/* Search and Actions */}
      <div className='flex w-full items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <Input
            {...register('searchInput')}
            placeholder='학생 이름을 입력해주세요'
            className='pl-10'
          />
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={handleReset}
            className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
            <RotateCcw className='h-4 w-4' />
            초기화
          </button>
          <button
            type='button'
            onClick={handleApply}
            className='bg-main hover:bg-main/90 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200'>
            적용
          </button>
        </div>
      </div>

      {/* Selected Students Section */}
      {selectedStudents.length > 0 && (
        <div className='rounded-xl border border-gray-200 bg-gray-50 p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <span className='text-sm font-semibold text-gray-700'>선택된 학생</span>
            <span className='bg-main inline-flex h-5 min-w-5 items-center justify-center rounded-lg px-2 text-xs font-bold text-white'>
              {selectedStudents.length}
            </span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {selectedStudents.map((student) => (
              <Tag
                key={student.id}
                label={student.name}
                color='dark'
                removable
                onClick={() => handleDeselectStudent(student.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Students Section */}
      <div className='flex flex-col gap-3'>
        <span className='text-sm font-semibold text-gray-700'>
          {searchValue ? '검색 결과' : '전체 학생'}
        </span>
        <div className='max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4'>
          {availableStudents.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {availableStudents.map((student) => (
                <Tag
                  key={student.id}
                  label={student.name}
                  icon={UserIcon}
                  onClick={() => handleSelectStudent(student)}
                />
              ))}
            </div>
          ) : (
            <div className='flex h-32 items-center justify-center'>
              <p className='text-sm font-medium text-gray-400'>
                {searchValue ? '검색 결과가 없습니다' : '학생이 없습니다'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSearchModal;
