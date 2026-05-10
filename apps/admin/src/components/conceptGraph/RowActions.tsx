import { Pencil, Trash2 } from 'lucide-react';

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const RowActions = ({ onEdit, onDelete }: RowActionsProps) => {
  return (
    <div className='flex items-center justify-end gap-1'>
      <button
        type='button'
        onClick={onEdit}
        aria-label='수정'
        className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800'>
        <Pencil className='h-4 w-4' />
      </button>
      <button
        type='button'
        onClick={onDelete}
        aria-label='삭제'
        className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600'>
        <Trash2 className='h-4 w-4' />
      </button>
    </div>
  );
};

export default RowActions;
