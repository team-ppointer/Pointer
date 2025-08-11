import { Button, Input, ComponentWithLabel } from '@components';
import { useForm } from 'react-hook-form';
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
  } = useForm<FormData>();
  const { mutate: createNotice } = postNotice();
  const { invalidateNotice } = useInvalidate();

  const onSubmit = (data: FormData) => {
    if (!selectedStudent) return;

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
            달력 컴포넌트까지 만들기엔 시간이 모자라서 일단 input으로 대체합니다...
            <ComponentWithLabel label='공지 시작일' isRequired>
              <Input
                type='date'
                {...register('startAt', {
                  required: '공지 시작일을 입력해주세요.',
                })}
                placeholder='공지 시작일을 선택해주세요'
                error={errors.startAt?.message}
              />
            </ComponentWithLabel>
            <ComponentWithLabel label='공지 종료일' isRequired>
              <Input
                type='date'
                {...register('endAt', {
                  required: '공지 종료일을 입력해주세요.',
                  validate: (value, formValues) => {
                    if (formValues.startAt && value < formValues.startAt) {
                      return '종료일은 시작일보다 늦어야 합니다.';
                    }
                    return true;
                  },
                })}
                placeholder='공지 종료일을 선택해주세요'
                error={errors.endAt?.message}
              />
            </ComponentWithLabel>
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
