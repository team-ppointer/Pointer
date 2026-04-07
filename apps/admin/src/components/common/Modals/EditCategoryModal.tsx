import { Button, Input } from '@components';
import { FolderEdit, Folder } from 'lucide-react';
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
    <div className='w-[480px] rounded-2xl bg-white p-8'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg shadow-gray-600/30'>
            <FolderEdit className='h-5 w-5 text-white' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>카테고리 수정</h2>
        </div>
      </div>

      <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
        {/* Category Name Input */}
        <div className='space-y-2'>
          <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
            <Folder className='h-4 w-4' />
            카테고리 이름
          </label>
          <Input
            placeholder='카테고리 이름을 입력해주세요'
            {...register('name', { required: true })}
            autoFocus
          />
          <p className='text-xs text-gray-500'>이 카테고리에 속한 모든 개념 태그에 적용됩니다.</p>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-3 pt-4'>
          <Button type='button' variant='light' onClick={onClose}>
            취소
          </Button>
          <Button type='submit' variant='dark'>
            수정 완료
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCategoryModal;
