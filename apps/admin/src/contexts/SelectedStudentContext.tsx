import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { components } from '@schema';
import { studentStorage } from '@utils';

type StudentResp = components['schemas']['StudentResp'];

interface SelectedStudentContextType {
  selectedStudent: StudentResp | null;
  setSelectedStudent: (student: StudentResp | null) => void;
  clearSelectedStudent: () => void;
}

const SelectedStudentContext = createContext<SelectedStudentContextType | undefined>(undefined);

export const SelectedStudentProvider = ({ children }: { children: ReactNode }) => {
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

  return (
    <SelectedStudentContext.Provider
      value={{
        selectedStudent,
        setSelectedStudent,
        clearSelectedStudent,
      }}>
      {children}
    </SelectedStudentContext.Provider>
  );
};

export const useSelectedStudent = () => {
  const context = useContext(SelectedStudentContext);
  if (context === undefined) {
    throw new Error('useSelectedStudent must be used within a SelectedStudentProvider');
  }
  return context;
};


