import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue';
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
    'w-full h-[5.6rem] rounded-[16px] font-medium-16 flex items-center justify-center gap-[1.6rem]';

  const variantStyles = {
    blue: 'bg-main text-white',
    disabled: 'bg-lightgray500 ',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[disabled ? 'disabled' : variant]} ${className} `}
      {...props}>
      {children}
    </button>
  );
};

export default Button;
