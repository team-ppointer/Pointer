import { Input, Modal } from '@components';
import { useForm } from 'react-hook-form';
import { putTeacher, postTeacher, putTeacherStudent } from '@apis';
import { useInvalidate, useModal } from '@hooks';
import { components } from '@schema';
import { useState } from 'react';
import { UserCircle, Mail, Lock, Users, Plus, X, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  const [selectedStudents, setSelectedStudents] = useState<components['schemas']['StudentResp'][]>(
    teacher?.students || []
  );

  const { mutate: updateTeacher } = putTeacher();
  const { mutate: updateTeacherStudent } = putTeacherStudent();
  const { mutate: createTeacher } = postTeacher();
  const invalidate = useInvalidate();

  const handleRemoveStudent = (studentId: number) => {
    setSelectedStudents((prev) => prev.filter((student) => student.id !== studentId));
  };

  const updateStudentAssignments = async () => {
    if (!teacher) return;

    return new Promise<void>((resolve, reject) => {
      updateTeacherStudent(
        {
          params: {
            path: { teacherId: teacher.id },
          },
          body: {
            students: selectedStudents.map((s) => s.id),
          },
        },
        {
          onSuccess: () => {
            invalidate.invalidateAll();
            resolve();
          },
          onError: (error) => {
            console.error('Failed to update teacher student:', error);
            reject(error);
          },
        }
      );
    });
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
          onSuccess: async () => {
            try {
              await updateStudentAssignments();
              onClose();
            } catch (error) {
              console.error('Failed to update student assignments:', error);
              invalidate.invalidateAll();
              onClose();
            }
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
      <div className='w-[600px] rounded-2xl bg-white p-8'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
            <Plus className='h-5 w-5 text-white' />
          </div>
          <h3 className='text-xl font-bold text-gray-900'>과외 선생 등록</h3>
        </div>

        <form className='space-y-6' onSubmit={handleSubmit(onCreateSubmit)}>
          <div>
            <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <UserCircle className='h-4 w-4 text-gray-500' />
              이름
            </label>
            <Input placeholder='이름을 입력해주세요' {...register('name', { required: true })} />
          </div>

          <div>
            <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <Mail className='h-4 w-4 text-gray-500' />
              아이디 (이메일)
            </label>
            <Input placeholder='아이디를 입력해주세요' {...register('email', { required: true })} />
          </div>

          <div>
            <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <Lock className='h-4 w-4 text-gray-500' />
              비밀번호
            </label>
            <div className='relative'>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder='비밀번호를 입력해주세요'
                {...register('password', { required: true })}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600'>
                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
              취소
            </button>
            <button
              type='submit'
              className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200'>
              등록
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className='w-[600px] rounded-2xl bg-white p-8'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
            <UserCircle className='h-5 w-5 text-white' />
          </div>
          <h3 className='text-xl font-bold text-gray-900'>선생 정보 수정</h3>
        </div>

        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <UserCircle className='h-4 w-4 text-gray-500' />
              이름
            </label>
            <Input placeholder='이름을 입력해주세요' {...register('name', { required: true })} />
          </div>

          <div>
            <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <Mail className='h-4 w-4 text-gray-500' />
              아이디 (이메일)
            </label>
            <Input placeholder='아이디를 입력해주세요' {...register('email', { required: true })} />
          </div>

          <div>
            <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <Lock className='h-4 w-4 text-gray-500' />
              비밀번호
            </label>
            <div className='relative'>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder='새 비밀번호를 입력해주세요 (변경 시만)'
                {...register('password')}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600'>
                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
            <p className='mt-1 text-xs text-gray-500'>비밀번호를 변경하지 않으려면 비워두세요</p>
          </div>

          <div>
            <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <Users className='h-4 w-4 text-gray-500' />
              담당 학생
            </label>
            <div className='flex flex-wrap gap-2'>
              {selectedStudents.map((student) => (
                <button
                  key={student.id}
                  type='button'
                  onClick={() => handleRemoveStudent(student.id)}
                  className='text-main border-main/20 bg-main/10 hover:border-main/40 hover:bg-main/20 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-200'>
                  {student.name}
                  <X className='h-3.5 w-3.5' />
                </button>
              ))}
              <button
                type='button'
                onClick={openModal}
                className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                <Plus className='h-3.5 w-3.5' />
                학생 추가
              </button>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
              취소
            </button>
            <button
              type='submit'
              className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200'>
              수정
            </button>
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
