import { Button, Modal, SearchInput, Tag } from '@components';
import { useForm } from 'react-hook-form';
import { putTeacher, deleteStudentFromTeacher, postAssignTeacher, postTeacher } from '@apis';
import { useInvalidate, useModal } from '@hooks';
import { components } from '@schema';
import { useState } from 'react';

import StudentSearchModal from './StudentSearchModal';

interface Props {
  teacher: components['schemas']['TeacherResp'] | null;
  onClose: () => void;
}

interface FormData {
  email: string;
  name: string;
  password: string;
}

const EditTeacherModal = ({ teacher, onClose }: Props) => {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: teacher?.email || '',
      name: teacher?.name || '',
      password: '',
    },
  });

  const { isOpen, openModal, closeModal } = useModal();

  const [selectedStudents, setSelectedStudents] = useState<components['schemas']['StudentResp'][]>(
    teacher?.students || []
  );

  const { mutate: updateTeacher } = putTeacher();
  const { mutate: deleteStudentFromTeacherMutate } = deleteStudentFromTeacher();
  const { mutate: postAssignTeacherMutate } = postAssignTeacher();
  const { mutate: createTeacher } = postTeacher();
  const invalidate = useInvalidate();

  const handleRemoveStudent = (studentId: number) => {
    setSelectedStudents((prev) => prev.filter((student) => student.id !== studentId));
  };

  const updateStudentAssignments = async () => {
    if (!teacher) return;

    const currentStudentIds = teacher.students.map((s) => s.id);
    const selectedStudentIds = selectedStudents.map((s) => s.id);

    const studentsToRemove = currentStudentIds.filter((id) => !selectedStudentIds.includes(id));

    const studentsToAdd = selectedStudentIds.filter((id) => !currentStudentIds.includes(id));

    const removePromises = studentsToRemove.map(
      (studentId) =>
        new Promise((resolve, reject) => {
          deleteStudentFromTeacherMutate(
            {
              params: {
                path: { teacherId: teacher.id, studentId },
              },
            },
            {
              onSuccess: resolve,
              onError: reject,
            }
          );
        })
    );

    const addPromises = studentsToAdd.map(
      (studentId) =>
        new Promise((resolve, reject) => {
          postAssignTeacherMutate(
            {
              params: {
                path: { teacherId: teacher.id },
              },
              body: { students: [studentId] },
            },
            {
              onSuccess: resolve,
              onError: reject,
            }
          );
        })
    );

    try {
      await Promise.all([...removePromises, ...addPromises]);
    } catch (error) {
      console.error('Failed to update student assignments:', error);
      throw error;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!teacher) return;

    try {
      const updateBody: {
        email: string;
        name: string;
        newPassword?: string;
      } = {
        email: data.email,
        name: data.name,
      };

      // 비밀번호가 입력된 경우만 포함
      if (data.password && data.password.trim() !== '') {
        updateBody.newPassword = data.password;
      }

      console.log('Updating teacher with data:', { teacherId: teacher.id, body: updateBody });

      updateTeacher(
        {
          params: {
            path: { id: teacher.id },
          },
          body: updateBody,
        },
        {
          onSuccess: () => {
            updateStudentAssignments()
              .then(() => {
                invalidate.invalidateAll();
                onClose();
              })
              .catch((error) => {
                console.error('Failed to update student assignments:', error);
                invalidate.invalidateAll();
                onClose();
              });
          },
          onError: (error) => {
            console.error('Failed to update teacher:', error);
          },
        }
      );
    } catch (error) {
      console.error('Failed to update teacher data:', error);
    }
  };

  const onCreateSubmit = async (data: FormData) => {
    try {
      createTeacher(
        {
          body: {
            email: data.email,
            name: data.name,
            password: data.password,
          },
        },
        {
          onSuccess: () => {
            invalidate.invalidateAll();
            onClose();
          },
          onError: (error) => {
            console.error('Failed to create teacher:', error);
          },
        }
      );
    } catch (error) {
      console.error('Failed to create teacher data:', error);
    }
  };

  if (!teacher) {
    return (
      <div className='w-4xl px-[6.4rem] py-[4.8rem]'>
        <h2 className='font-bold-24 text-black'>새로운 아이디 등록</h2>
        <form className='mt-16 flex flex-col gap-[3.2rem]' onSubmit={handleSubmit(onCreateSubmit)}>
          <SearchInput
            sizeType='full'
            label='이름'
            placeholder='이름을 입력해주세요.'
            {...register('name', { required: '이름은 필수입니다.' })}
          />
          <SearchInput
            sizeType='full'
            label='아이디'
            placeholder='아이디를 입력해주세요.'
            {...register('email', { required: '아이디는 필수입니다.' })}
          />
          <SearchInput
            sizeType='full'
            label='비밀번호'
            placeholder='비밀번호를 입력해주세요.'
            type='password'
            {...register('password', { required: '비밀번호는 필수입니다.' })}
          />
          <div className='mt-[5.6rem] flex justify-end gap-[1.6rem]'>
            <Button type='button' variant='light' onClick={onClose}>
              취소
            </Button>
            <Button type='submit' variant='dark'>
              등록
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className='w-4xl px-[6.4rem] py-[4.8rem]'>
        <h2 className='font-bold-24 text-black'>과외 선생 정보 수정</h2>
        <form className='mt-16 flex flex-col gap-[3.2rem]' onSubmit={handleSubmit(onSubmit)}>
          <SearchInput
            sizeType='full'
            label='이름'
            placeholder='이름을 입력해주세요.'
            {...register('name', { required: '이름은 필수입니다.' })}
          />
          <SearchInput
            sizeType='full'
            label='아이디'
            placeholder='아이디를 입력해주세요.'
            {...register('email', { required: '아이디는 필수입니다.' })}
          />
          <SearchInput
            sizeType='full'
            label='비밀번호'
            placeholder='새 비밀번호를 입력해주세요.'
            type='password'
            {...register('password')}
          />
          <div className='flex flex-col gap-[1.2rem]'>
            <span className='font-medium-18 text-black'>담당학생</span>
            <div className='flex flex-wrap gap-[0.8rem]'>
              {selectedStudents.map((student) => (
                <Tag
                  key={student.id}
                  label={student.name}
                  color='dark'
                  removable
                  onClick={() => handleRemoveStudent(student.id)}
                />
              ))}
              <Tag label='학생 추가하기' color='lightgray' onClick={openModal} />
            </div>
          </div>
          <div className='mt-[5.6rem] flex justify-end gap-[1.6rem]'>
            <Button type='button' variant='light' onClick={onClose}>
              취소
            </Button>
            <Button type='submit' variant='dark'>
              수정
            </Button>
          </div>
        </form>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <StudentSearchModal
          teacher={teacher}
          selectedStudents={selectedStudents}
          setSelectedStudents={setSelectedStudents}
          onApply={closeModal}
        />
      </Modal>
    </>
  );
};

export default EditTeacherModal;
