import React, { ButtonHTMLAttributes } from 'react';

import { IcLeftArrow, IcRightArrow } from '@svg';

interface NavigationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'next' | 'prev';
  label: string;
}

const NavigationButton = ({ variant, label, onClick }: NavigationButtonProps) => {
  return (
    <button
      type='button'
      className='font-medium-14 flex h-[4.8rem] w-fit items-center justify-center gap-[1.6rem] text-black'
      onClick={onClick}>
      {variant === 'prev' && <IcLeftArrow width={10.76} height={21} />}
      <span>{label}</span>
      {variant === 'next' && <IcRightArrow width={10.76} height={21} />}
    </button>
  );
};

export default NavigationButton;
