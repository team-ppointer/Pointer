import { Button, Input } from '@components';
import { postPracticeTest } from '@apis';
import { useInvalidate } from '@hooks';
import { useForm } from 'react-hook-form';
import { Calendar, GraduationCap, Clock, FileText, Plus, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

interface FormData {
  year: number;
  grade: number;
  month: number;
  name: string;
}

const CreatePracticeTestModal = ({ onClose }: Props) => {
  const { invalidateAll } = useInvalidate();
  const { mutate: createPracticeTest, isPending } = postPracticeTest();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const onSubmit = (data: FormData) => {
    createPracticeTest(
      {
        body: {
          year: data.year,
          month: data.month,
          grade: data.grade,
          name: data.name,
        },
      },
      {
        onSuccess: () => {
          invalidateAll();
          onClose();
        },
        onError: (error) => {
          console.error('모의고사 생성 실패:', error);
        },
      }
    );
  };

  return (
    <div className='w-[480px] overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-main)] to-[var(--color-main)]/80 shadow-[var(--color-main)]/20 shadow-lg'>
            <Plus className='h-5 w-5 text-white' />
          </div>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>새 모의고사 추가</h2>
            <p className='text-sm text-gray-500'>모의고사 정보를 입력해주세요</p>
          </div>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
          <X className='h-5 w-5' />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
        <div className='space-y-4'>
          {/* Year & Month Row */}
          <div className='flex gap-4'>
            <div className='flex-1'>
              <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
                <Calendar className='h-4 w-4 text-[var(--color-main)]' />
                년도
              </label>
              <div className='relative'>
                <Input
                  {...register('year', {
                    required: '년도를 입력해주세요.',
                    min: { value: 1900, message: '올바른 년도를 입력해주세요.' },
                    max: { value: 2100, message: '올바른 년도를 입력해주세요.' },
                    valueAsNumber: true,
                  })}
                  placeholder='예: 2024'
                  type='number'
                  className={errors.year ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>
              {errors.year && (
                <p className='mt-1 text-xs font-medium text-red-500'>{errors.year.message}</p>
              )}
            </div>

            <div className='flex-1'>
              <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
                <Clock className='h-4 w-4 text-[var(--color-main)]' />월
              </label>
              <div className='relative'>
                <Input
                  {...register('month', {
                    required: '월을 입력해주세요.',
                    min: { value: 1, message: '1-12 사이로 입력해주세요.' },
                    max: { value: 12, message: '1-12 사이로 입력해주세요.' },
                    valueAsNumber: true,
                  })}
                  placeholder='예: 6'
                  type='number'
                  className={errors.month ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>
              {errors.month && (
                <p className='mt-1 text-xs font-medium text-red-500'>{errors.month.message}</p>
              )}
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <GraduationCap className='h-4 w-4 text-[var(--color-main)]' />
              학년
            </label>
            <div className='relative'>
              <Input
                {...register('grade', {
                  required: '학년을 입력해주세요.',
                  min: { value: 1, message: '1-3 사이로 입력해주세요.' },
                  max: { value: 3, message: '1-3 사이로 입력해주세요.' },
                  valueAsNumber: true,
                })}
                placeholder='예: 3'
                type='number'
                className={errors.grade ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>
            {errors.grade && (
              <p className='mt-1 text-xs font-medium text-red-500'>{errors.grade.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <FileText className='h-4 w-4 text-[var(--color-main)]' />
              모의고사 이름
            </label>
            <div className='relative'>
              <Input
                {...register('name', {
                  required: '모의고사 이름을 입력해주세요.',
                  minLength: { value: 1, message: '모의고사 이름을 입력해주세요.' },
                })}
                placeholder='예: 6월 모의고사'
                className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>
            {errors.name && (
              <p className='mt-1 text-xs font-medium text-red-500'>{errors.name.message}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='mt-8 flex justify-end gap-3'>
          <Button type='button' variant='light' onClick={onClose} disabled={isPending}>
            취소
          </Button>
          <button
            type='submit'
            disabled={isPending || !isValid}
            className='bg-main shadow-main/20 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'>
            {isPending ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                추가 중...
              </>
            ) : (
              <>
                <Plus className='h-4 w-4' />
                추가하기
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePracticeTestModal;
