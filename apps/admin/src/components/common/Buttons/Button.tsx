import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'dark' | 'light' | 'dimmed';
  sizeType?: 'short' | 'long' | 'fit' | 'full';
  disabled?: boolean;
  children: React.ReactNode;
}

const Button = ({
  variant = 'blue',
  sizeType = 'short',
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'rounded-[0.8rem] font-14m-body flex items-center justify-center whitespace-nowrap break-keep';

  const sizeStyles = {
    short: 'min-w-[9.6rem] w-[9.6rem] h-[4.0rem]',
    long: 'min-w-[34.8rem] w-[34.8rem] h-[4.0rem]',
    fit: 'w-fit h-[4.0rem] px-[1.6rem]',
    full: 'w-full h-[4.0rem]',
  };

  const variantStyles = {
    blue: 'bg-blue text-white',
    dark: 'bg-darkgray100 text-white',
    light: 'bg-white text-black border border-lightgray500',
    dimmed: 'bg-transparent text-lightgray500',
    disabled: 'bg-lightgray300 text-lightgray500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[sizeType]} ${variantStyles[disabled ? 'disabled' : variant]} ${className}`}
      {...props}>
      {children}
    </button>
  );
};

export default Button;
