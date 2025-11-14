import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'dark' | 'light' | 'dimmed' | 'primary' | 'secondary' | 'danger' | 'ghost';
  sizeType?: 'short' | 'long' | 'fit' | 'full' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

const Button = ({
  variant = 'blue',
  sizeType = 'fit',
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'rounded-xl font-semibold text-sm flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2';

  const sizeStyles = {
    // Legacy sizes
    short: 'min-w-[96px] px-4 py-2.5',
    long: 'min-w-[348px] px-6 py-2.5',
    fit: 'w-fit px-6 py-2.5',
    full: 'w-full px-6 py-2.5',
    // New semantic sizes
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  // Map legacy variant names to new ones
  const normalizedVariant =
    variant === 'blue' ? 'primary' : variant === 'dark' ? 'secondary' : variant;

  const variantStyles = {
    // Primary button (Main color)
    primary: 'bg-main text-white hover:bg-main/90 focus:ring-main/20',
    blue: 'bg-main text-white hover:bg-main/90 focus:ring-main/20',

    // Secondary button (Outline style)
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-300',
    dark: 'bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-300',

    // Light/Outline button
    light:
      'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:ring-main/20',

    // Ghost button
    ghost: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-200',
    dimmed: 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:ring-gray-200',

    // Danger button
    danger:
      'bg-red-50 border border-red-100 shadow-red-500/10 text-red-600 hover:border-red-200 hover:bg-red-100/80',
    'danger-outline':
      'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 focus:ring-red-200',

    // Disabled state
    disabled: 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[sizeType]} ${variantStyles[disabled ? 'disabled' : normalizedVariant]} ${className ?? ''}`}
      disabled={disabled}
      {...props}>
      {children}
    </button>
  );
};

export default Button;
