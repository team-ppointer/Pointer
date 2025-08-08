import { Button, Input } from '@components';
import { postPracticeTest } from '@apis';
import { useInvalidate } from '@hooks';
import { useForm } from 'react-hook-form';

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
    formState: { errors },
  } = useForm<FormData>();

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
    <>
      <div className='w-[80dvw] px-[6.4rem] py-[4.8rem]'>
        <h2 className='font-bold-24 text-black'>모의고사 새로 추가</h2>
        <form className='mt-16 flex gap-[3.2rem]' onSubmit={handleSubmit(onSubmit)}>
          <div className='flex w-[90rem] items-center gap-[1.2rem]'>
            <Input
              {...register('year', {
                required: '년도를 입력해주세요.',
                min: { value: 1900, message: '올바른 년도를 입력해주세요.' },
                max: { value: 2100, message: '올바른 년도를 입력해주세요.' },
                valueAsNumber: true,
              })}
              placeholder='숫자 4자리 입력'
              type='number'
            />
            <span className='font-medium-18 break-keep text-black'>년도</span>
          </div>
          <div className='flex w-[90rem] items-center gap-[1.2rem]'>
            <Input
              {...register('grade', {
                required: '학년을 입력해주세요.',
                min: { value: 1, message: '1-3 사이의 학년을 입력해주세요.' },
                max: { value: 3, message: '1-3 사이의 학년을 입력해주세요.' },
                valueAsNumber: true,
              })}
              placeholder='숫자 1자리 입력'
              type='number'
            />
            <span className='font-medium-18 break-keep text-black'>학년</span>
          </div>
          <div className='flex w-[90rem] items-center gap-[1.2rem]'>
            <Input
              {...register('month', {
                required: '월을 입력해주세요.',
                min: { value: 1, message: '1-12 사이의 월을 입력해주세요.' },
                max: { value: 12, message: '1-12 사이의 월을 입력해주세요.' },
                valueAsNumber: true,
              })}
              placeholder='숫자 1자리 or 2자리 입력'
              type='number'
            />
            <span className='font-medium-18 break-keep text-black'>월</span>
          </div>
          <Input
            {...register('name', {
              required: '모의고사 이름을 입력해주세요.',
              minLength: { value: 1, message: '모의고사 이름을 입력해주세요.' },
            })}
            placeholder='학력고사 or 모의고사 입력'
          />
        </form>

        {/* 에러 메시지 표시 */}
        {(errors.year || errors.grade || errors.month || errors.name) && (
          <div className='mt-4'>
            {Object.values(errors).map((error, index) => (
              <p key={index} className='text-red font-medium-14 mt-1'>
                {error?.message}
              </p>
            ))}
          </div>
        )}

        <div className='mt-[5.6rem] flex justify-end gap-[1.6rem]'>
          <Button type='button' variant='light' onClick={onClose} disabled={isPending}>
            취소
          </Button>
          <Button
            type='submit'
            variant='dark'
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}>
            {isPending ? '추가 중...' : '추가'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreatePracticeTestModal;
