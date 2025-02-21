import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'dark' | 'light' | 'dimmed';
  sizeType?: 'short' | 'long';
  children: React.ReactNode;
}

const Button = ({
  variant = 'blue',
  sizeType = 'short',
  children,
  className,
  ...props
}: ButtonProps) => {
  const baseStyles = 'rounded-[8px] font-medium-18 flex items-center justify-center';

  const sizeStyles = {
    short: 'min-w-[12rem] w-[12rem] h-[5.6rem]',
    long: 'min-w-[34.8rem] w-[34.8rem] h-[5.6rem]',
  };

  const variantStyles = {
    blue: 'bg-blue text-white',
    dark: 'bg-darkgray100 text-white',
    light: 'bg-white text-black border border-lightgray500',
    dimmed: 'bg-transparent text-lightgray500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[sizeType]} ${variantStyles[variant]} ${className}`}
      {...props}>
      {children}
    </button>
  );
};

export default Button;
