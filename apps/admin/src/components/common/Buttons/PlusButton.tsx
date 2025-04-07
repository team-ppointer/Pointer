import { IcPlus } from '@svg';
import { ButtonHTMLAttributes } from 'react';

interface PlusButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'dark' | 'light';
}

const PlusButton = ({ variant = 'dark', ...props }: PlusButtonProps) => {
  const variantStyles = {
    dark: 'bg-darkgray100',
    light: 'bg-lightgray500',
  };

  return (
    <button
      type='button'
      className={`${variantStyles[variant]} flex h-[6rem] w-[6rem] min-w-[6rem] items-center justify-center rounded-full`}
      {...props}>
      <IcPlus width={24} height={24} />
    </button>
  );
};

export default PlusButton;
