import clsx from 'clsx';
import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  children: React.ReactNode;
}

const Button = ({ disabled = false, children, className, ...props }: ButtonProps) => {
  const baseStyles =
    'w-fit h-fit bg-white border border-sub1 rounded-[0.8rem] flex items-center justify-center p-[0.4rem]';

  return (
    <button className={clsx(baseStyles, className)} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
