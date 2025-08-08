import { Button } from '@components';
import { components } from '@schema';

interface Props {
  students: components['schemas']['StudentResp'][];
  selectedStudent: components['schemas']['StudentResp'] | null;
  setSelectedStudent: React.Dispatch<
    React.SetStateAction<components['schemas']['StudentResp'] | null>
  >;
  onApply: () => void;
}
const SelectStudentModal = ({ students, selectedStudent, setSelectedStudent, onApply }: Props) => {
  const handleSelectStudent = (student: components['schemas']['StudentResp']) => {
    setSelectedStudent(student);
    onApply();
  };

  return (
    <div className='w-[50dvw] px-[6.4rem] py-[4.8rem]'>
      <h2 className='font-bold-24 text-black'>학생 선택</h2>
      <div className='mt-[3.2rem] grid grid-cols-6 gap-[1.6rem]'>
        {students.map((student) => (
          <Button
            key={student.id}
            variant={selectedStudent?.id === student.id ? 'dark' : 'light'}
            sizeType='full'
            onClick={() => handleSelectStudent(student)}>
            {student.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SelectStudentModal;
