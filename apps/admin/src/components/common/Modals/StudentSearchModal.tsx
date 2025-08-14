import { getStudent } from '@apis';
import { Button, SearchInput, Tag } from '@components';
import { components } from '@schema';

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
  const { data: studentList } = getStudent({ query: '' });

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
    <div className='w-[70dvw] px-1600 py-1200'>
      <h2 className='font-bold-24 text-black'>담당 학생 검색</h2>
      <form className='mt-800 flex flex-col gap-800'>
        <div className='flex items-center justify-between'>
          <SearchInput placeholder='학생 이름을 입력해주세요.' sizeType='long' />
          <div className='flex justify-end gap-400'>
            <Button type='button' variant='light' onClick={handleReset}>
              초기화
            </Button>
            <Button type='button' variant='dark' onClick={handleApply}>
              적용
            </Button>
          </div>
        </div>
        <div className='flex flex-wrap gap-200'>
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
        <div className='flex flex-wrap gap-200'>
          {studentList?.data
            .filter((student) => !selectedStudents.some((s) => s.id === student.id))
            .map((student) => (
              <Tag
                key={student.id}
                label={student.name}
                color='light'
                onClick={() => handleSelectStudent(student)}
              />
            ))}
        </div>
      </form>
    </div>
  );
};

export default StudentSearchModal;
