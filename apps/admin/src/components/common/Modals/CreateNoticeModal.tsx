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
      <div className='w-[52rem] p-[3.2rem]'>
        <h2 className='font-bold-24 mb-[2.4rem] text-black'>공지 작성</h2>
        <p className='font-medium-16 text-lightgray500 mb-[2.4rem]'>
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
    <div className='w-[70dvw] p-[3.2rem]'>
      <h2 className='font-bold-24 mb-[2.4rem] text-black'>공지 작성</h2>

      {/* <div className='bg-lightgray100 mb-[2.4rem] rounded-[0.8rem] p-[1.6rem]'>
        <p className='font-medium-14 text-lightgray600 mb-[0.4rem]'>공지 대상</p>
        <p className='font-bold-16 text-black'>{selectedStudent.name}</p>
      </div> */}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-[2.4rem]'>
        <div className='grid grid-cols-2 gap-[1.6rem]'>
          <div className='flex flex-col gap-[1.6rem]'>
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
              className={`font-medium-16 bg-lightgray100 h-full w-full resize-none rounded-[1.6rem] p-[3.2rem] ${
                errors.content
                  ? 'border-red focus:border-red'
                  : 'border-lightgray300 focus:border-black'
              }`}
            />
            {errors.content && (
              <p className='font-medium-14 text-red mt-[0.8rem]'>{errors.content.message}</p>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-[1.6rem] pt-[2.4rem]'>
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
