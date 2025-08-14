import { useState, useEffect, useCallback } from 'react';
import { components } from '@schema';
import { studentStorage } from '@utils';

type StudentResp = components['schemas']['StudentResp'];

const useSelectedStudent = () => {
  const [selectedStudent, setSelectedStudentState] = useState<StudentResp | null>(null);

  useEffect(() => {
    const storedStudent = studentStorage.getSelectedStudent();

    if (storedStudent) {
      setSelectedStudentState(storedStudent);
    }
  }, []);

  const setSelectedStudent = useCallback((student: StudentResp | null) => {
    setSelectedStudentState(student);

    studentStorage.setSelectedStudent(student);
  }, []);

  const clearSelectedStudent = useCallback(() => {
    setSelectedStudentState(null);

    studentStorage.clearSelectedStudent();
  }, []);

  return {
    selectedStudent,
    setSelectedStudent,
    clearSelectedStudent,
  };
};

export default useSelectedStudent;
