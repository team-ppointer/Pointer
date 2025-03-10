import { ButtonHTMLAttributes } from 'react';

interface SmallButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'underline' | 'disabled';
  sizeType?: 'small' | 'medium';
  children: React.ReactNode;
}

const SmallButton = ({
  variant = 'blue',
  sizeType = 'medium',
  children,
  className,
  ...props
}: SmallButtonProps) => {
  const baseStyles =
    'h-[3.2rem] px-[1.2rem] py-[0.6rem] rounded-[8px] flex items-center justify-center';

  const variantStyles = {
    blue: 'bg-main text-white',
    disabled: 'bg-lightgray300 text-lightgray500',
    underline: 'bg-none text-main underline',
  };

  const sizeTypeStyles = {
    small: 'font-medium-12',
    medium: 'font-medium-14',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeTypeStyles[sizeType]} ${className || ''}`}
      disabled={variant === 'disabled'}
      {...props}>
      {children}
    </button>
  );
};

export default SmallButton;
