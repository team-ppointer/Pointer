import { components } from '@schema';

import BaseBottomSheetTemplate from './BaseBottomSheetTemplate';

type ListRespStudentResp = components['schemas']['ListRespStudentResp'];

interface StudentSelectBottomSheetTemplate {
  handleClickStudent: (student: { id: number; name: string }) => void;
  students: ListRespStudentResp;
  selectedStudentId?: number;
}

const StudentSelectBottomSheetTemplate = ({
  handleClickStudent,
  students,
  selectedStudentId,
}: StudentSelectBottomSheetTemplate) => {
  return (
    <BaseBottomSheetTemplate>
      <BaseBottomSheetTemplate.Content>
        <BaseBottomSheetTemplate.Text text={'학생 변경'} />
      </BaseBottomSheetTemplate.Content>
      <BaseBottomSheetTemplate.ButtonSection>
        {students.data.map((student) => (
          <BaseBottomSheetTemplate.StudentSelectButton
            key={student.id}
            variant={student.id === selectedStudentId ? 'recommend' : 'default'}
            label={student.name}
            onClick={() => handleClickStudent({ id: student.id, name: student.name })}
          />
        ))}
      </BaseBottomSheetTemplate.ButtonSection>
    </BaseBottomSheetTemplate>
  );
};

export default StudentSelectBottomSheetTemplate;
