import { Button, SearchInput } from '@components';
import { useForm } from 'react-hook-form';

interface Props {
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  defaultName?: string;
}

const EditCategoryModal = ({ onClose, onSubmit, defaultName }: Props) => {
  const { register, handleSubmit } = useForm<{ name: string }>({
    defaultValues: { name: defaultName ?? '' },
  });
  return (
    <div className='w-4xl px-1600 py-1200'>
      <h2 className='font-bold-24 text-black'>대분류 제목 수정</h2>
      <form className='mt-16 flex flex-col gap-800' onSubmit={handleSubmit(onSubmit)}>
        <SearchInput
          sizeType='full'
          label='제목'
          placeholder='입력해주세요'
          {...register('name', { required: true })}
        />
        <div className='mt-[5.6rem] flex justify-end gap-400'>
          <Button type='button' variant='light' onClick={onClose}>
            취소
          </Button>
          <Button type='submit' variant='dark'>
            수정
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCategoryModal;
