import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        {...rest}
        className={`focus:border-main focus:ring-main/20 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:outline-none ${className}`}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
