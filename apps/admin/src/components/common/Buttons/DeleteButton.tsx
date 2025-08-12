import { IcDelete, IcTrash16 } from '@svg';
import { ButtonHTMLAttributes } from 'react';

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium';
  label: string;
  onClick?: () => void;
}

const DeleteButton = ({ size = 'medium', label, onClick }: DeleteButtonProps) => {
  const sizeStyle = {
    small: 'font-medium-14',
    medium: 'font-medium-18',
  };
  return (
    <button
      type='button'
      className='bg-lightred rounded-200 flex items-center justify-center gap-200 px-400 py-200 whitespace-nowrap'
      onClick={onClick}>
      {size === 'small' ? (
        <IcTrash16 width={16} height={16} />
      ) : (
        <IcDelete width={24} height={24} />
      )}
      <span className={`text-red ${sizeStyle[size]}`}>{label}</span>
    </button>
  );
};

export default DeleteButton;
