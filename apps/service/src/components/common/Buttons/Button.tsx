import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'light';
  disabled?: boolean;
  children: React.ReactNode;
}

const Button = ({
  variant = 'blue',
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'w-full h-[5.6rem] min-w-fit rounded-[16px] font-medium-16 flex items-center justify-center gap-[1.6rem] px-[1rem]';

  const variantStyles = {
    blue: 'bg-main text-white',
    light: 'bg-white text-main border border-main',
    disabled: 'bg-lightgray300 text-lightgray500',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[disabled ? 'disabled' : variant]} ${className} `}
      disabled={disabled}
      {...props}>
      {children}
    </button>
  );
};

export default Button;
