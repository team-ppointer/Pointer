import { IcDelete } from '@svg';
import { ButtonHTMLAttributes } from 'react';

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

const DeleteButton = ({ label }: DeleteButtonProps) => {
  return (
    <button className='bg-lightred flex h-[4.3rem] w-[13.1rem] items-center justify-center gap-[0.8rem] rounded-[0.8rem] px-[1.6rem] py-[0.95rem]'>
      <IcDelete width={24} height={24} />
      <span className='font-medium-18 text-red'>{label}</span>
    </button>
  );
};

export default DeleteButton;
