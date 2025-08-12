import { components } from '@schema';

type StudentResp = components['schemas']['StudentResp'];

const createStudentStorage = () => {
  const SELECTED_STUDENT_KEY = 'pointer_admin_selected_student';

  const getSelectedStudent = (): StudentResp | null => {
    try {
      const stored = localStorage.getItem(SELECTED_STUDENT_KEY);

      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to get selected student from localStorage:', error);

      return null;
    }
  };

  const setSelectedStudent = (student: StudentResp | null): void => {
    try {
      if (student) {
        localStorage.setItem(SELECTED_STUDENT_KEY, JSON.stringify(student));
      } else {
        localStorage.removeItem(SELECTED_STUDENT_KEY);
      }
    } catch (error) {
      console.warn('Failed to save selected student to localStorage:', error);
    }
  };

  const clearSelectedStudent = (): void => {
    try {
      localStorage.removeItem(SELECTED_STUDENT_KEY);
    } catch (error) {
      console.warn('Failed to clear selected student from localStorage:', error);
    }
  };

  return {
    getSelectedStudent,
    setSelectedStudent,
    clearSelectedStudent,
  };
};

export const studentStorage = createStudentStorage();
