import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { ListChecks, X } from 'lucide-react';
import { Button, Input } from '@components';
import { createMockExamType, updateMockExamType } from '@apis';
import { useInvalidate } from '@hooks';

import { extractErrorMessage } from '@/components/conceptGraph/utils';
import type { components } from '@/types/api/schema';

type MockExamType = components['schemas']['MockExamTypeResp'];

const formSchema = z
  .object({
    code: z.string().min(1, '코드를 입력해주세요').max(20, '20자 이내로 입력해주세요'),
    displayName: z.string().min(1, '표시명을 입력해주세요').max(100, '100자 이내로 입력해주세요'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식'),
  })
  .refine((d) => !dayjs(d.endDate).isBefore(d.startDate, 'day'), {
    message: '종료일은 시작일 이후여야 합니다',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof formSchema>;

interface Props {
  mode: 'create' | 'edit';
  target?: MockExamType;
  onClose: () => void;
}

const TypeFormModal = ({ mode, target, onClose }: Props) => {
  const isEditMode = mode === 'edit';
  const { invalidateMockExamTypes } = useInvalidate();

  const createMutation = createMockExamType();
  const updateMutation = updateMockExamType();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      code: target?.code ?? '',
      displayName: target?.displayName ?? '',
      startDate: target?.startDate ?? '',
      endDate: target?.endDate ?? '',
    },
  });

  useEffect(() => {
    reset({
      code: target?.code ?? '',
      displayName: target?.displayName ?? '',
      startDate: target?.startDate ?? '',
      endDate: target?.endDate ?? '',
    });
  }, [target, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditMode && target?.id !== undefined) {
        await updateMutation.mutateAsync({
          params: { path: { id: target.id } },
          body: {
            displayName: values.displayName.trim(),
            startDate: values.startDate,
            endDate: values.endDate,
          },
        });
        await invalidateMockExamTypes();
        toast.success('모의고사 타입이 수정되었습니다');
      } else {
        await createMutation.mutateAsync({
          body: {
            code: values.code.trim(),
            displayName: values.displayName.trim(),
            startDate: values.startDate,
            endDate: values.endDate,
          },
        });
        await invalidateMockExamTypes();
        toast.success('모의고사 타입이 생성되었습니다');
      }
      onClose();
    } catch (error) {
      const message = extractErrorMessage(error);
      const errorCode = (error as { response?: { data?: { code?: unknown } } }).response?.data
        ?.code;
      if (!isEditMode && errorCode === 'MOCK_EXAM_001') {
        setError('code', { type: 'server', message });
      } else {
        toast.error(message);
      }
    }
  };

  const title = isEditMode ? '모의고사 타입 수정' : '새 모의고사 타입';

  return (
    <div className='w-[520px] rounded-2xl bg-white p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='bg-main shadow-main/30 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg'>
            <ListChecks className='h-5 w-5 text-white' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>{title}</h2>
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='닫기'
          className='flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
          <X className='h-5 w-5' />
        </button>
      </div>

      <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>코드</label>
          <Input
            placeholder='예: 2026-06'
            autoFocus={!isEditMode}
            readOnly={isEditMode}
            {...register('code')}
            className={
              isEditMode
                ? 'cursor-not-allowed bg-gray-50 text-gray-500'
                : errors.code
                  ? 'border-red-300 focus:border-red-500'
                  : ''
            }
          />
          {isEditMode && <p className='text-xs text-gray-500'>코드는 수정할 수 없습니다</p>}
          {errors.code && <p className='text-xs font-medium text-red-500'>{errors.code.message}</p>}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>표시명</label>
          <Input
            placeholder='예: 2026년 6월 모의고사'
            {...register('displayName')}
            className={errors.displayName ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.displayName && (
            <p className='text-xs font-medium text-red-500'>{errors.displayName.message}</p>
          )}
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-gray-700'>시작일</label>
            <Input
              type='date'
              {...register('startDate')}
              className={errors.startDate ? 'border-red-300 focus:border-red-500' : ''}
            />
            {errors.startDate && (
              <p className='text-xs font-medium text-red-500'>{errors.startDate.message}</p>
            )}
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-gray-700'>종료일</label>
            <Input
              type='date'
              {...register('endDate')}
              className={errors.endDate ? 'border-red-300 focus:border-red-500' : ''}
            />
            {errors.endDate && (
              <p className='text-xs font-medium text-red-500'>{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-3 pt-2'>
          <Button type='button' variant='light' onClick={onClose} disabled={isPending}>
            취소
          </Button>
          <Button type='submit' variant='dark' disabled={isPending || !isValid}>
            {isEditMode ? '수정 완료' : '등록하기'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TypeFormModal;
