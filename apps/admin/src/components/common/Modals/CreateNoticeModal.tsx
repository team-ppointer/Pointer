import { Button, DateRangePicker } from '@components';
import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';
import { postNotice } from '@apis';
import { useInvalidate } from '@hooks';
import { components } from '@schema';

interface Props {
  selectedStudent: components['schemas']['StudentResp'] | null;
  onClose: () => void;
}

interface FormData {
  startAt: string;
  endAt: string;
  content: string;
}

const CreateNoticeModal = ({ selectedStudent, onClose }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    mode: 'onChange',
  });
  const { mutate: createNotice } = postNotice();
  const { invalidateNotice } = useInvalidate();

  const startAt = watch('startAt');
  const endAt = watch('endAt');

  // 날짜 필드 validation 등록
  useEffect(() => {
    register('startAt', {
      required: '공지 시작일을 선택해주세요.',
    });
    register('endAt', {
      required: '공지 종료일을 선택해주세요.',
      validate: (value) => {
        if (startAt && value < startAt) {
          return '종료일은 시작일보다 늦어야 합니다.';
        }
        return true;
      },
    });
  }, [register, startAt]);

  const handleDateRangeChange = useCallback(
    (startDate: string, endDate: string) => {
      console.log('CreateNoticeModal: 받은 날짜 범위', { startDate, endDate });
      setValue('startAt', startDate, { shouldValidate: true });
      setValue('endAt', endDate, { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = (data: FormData) => {
    if (!selectedStudent) return;

    console.log('CreateNoticeModal: 제출할 데이터', {
      startAt: data.startAt,
      endAt: data.endAt,
      content: data.content,
      studentId: selectedStudent.id,
    });

    createNotice(
      {
        body: {
          startAt: data.startAt,
          endAt: data.endAt,
          content: data.content,
          studentId: selectedStudent.id,
        },
      },
      {
        onSuccess: () => {
          invalidateNotice();
          onClose();
        },
      }
    );
  };

  if (!selectedStudent) {
    return (
      <div className='w-[52rem] p-800'>
        <h2 className='font-bold-24 mb-600 text-black'>공지 작성</h2>
        <p className='font-medium-16 text-lightgray500 mb-600'>
          공지를 작성하려면 먼저 학생을 선택해주세요.
        </p>
        <div className='flex justify-end'>
          <Button variant='light' onClick={onClose}>
            확인
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-[70dvw] p-800'>
      <h2 className='font-bold-24 mb-600 text-black'>공지 작성</h2>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-600'>
        <div className='grid grid-cols-2 gap-400'>
          <div className='flex flex-col gap-400'>
            <DateRangePicker
              startDate={startAt}
              endDate={endAt}
              onDateRangeChange={handleDateRangeChange}
              error={errors.startAt?.message || errors.endAt?.message}
            />
          </div>

          <div>
            <textarea
              {...register('content', {
                required: '공지 내용을 입력해주세요.',
              })}
              placeholder='여기에 공지를 작성해주세요.'
              className={`font-medium-16 bg-lightgray100 rounded-400 h-full w-full resize-none p-800 ${
                errors.content
                  ? 'border-red focus:border-red'
                  : 'border-lightgray300 focus:border-black'
              }`}
            />
            {errors.content && (
              <p className='font-medium-14 text-red mt-200'>{errors.content.message}</p>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-400 pt-600'>
          {/* <Button variant='light' onClick={onClose}>
            취소
          </Button> */}
          <Button variant='dark' type='submit'>
            완료
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateNoticeModal;
