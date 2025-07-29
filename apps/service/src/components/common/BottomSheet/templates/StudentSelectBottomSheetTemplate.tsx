import { components } from '@schema';
import BaseBottomSheetTemplate from './BaseBottomSheetTemplate';

type ListRespStudentResp = components['schemas']['ListRespStudentResp'];

interface StudentSelectBottomSheetTemplate {
  handleClickStudent: () => void;
  students: ListRespStudentResp;
}

const StudentSelectBottomSheetTemplate = ({
  handleClickStudent,
  students,
}: StudentSelectBottomSheetTemplate) => {
  console.log(students);
  return (
    <BaseBottomSheetTemplate>
      <BaseBottomSheetTemplate.Content>
        <BaseBottomSheetTemplate.Text text={'학생 변경'} />
      </BaseBottomSheetTemplate.Content>
      <BaseBottomSheetTemplate.ButtonSection>
        {students.data.map((student) => (
          <BaseBottomSheetTemplate.Button
            key={student.id}
            variant='recommend'
            label={student.name}
            onClick={handleClickStudent}
          />
        ))}
      </BaseBottomSheetTemplate.ButtonSection>
    </BaseBottomSheetTemplate>
  );
};

export default StudentSelectBottomSheetTemplate;
