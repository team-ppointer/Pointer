import clsx from 'clsx';
import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children: React.ReactNode;
}

const Button = ({
  disabled = false,
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) => {
  const baseStyles = clsx(
    'w-fit h-fit  rounded-[0.8rem] flex items-center justify-center p-[0.4rem]',
    {
      'bg-white border border-sub1': variant === 'primary',
      'bg-main': variant === 'secondary',
    }
  );

  return (
    <button className={clsx(baseStyles, className)} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
