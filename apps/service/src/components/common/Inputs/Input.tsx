import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ ...props }, ref) => {
    return (
      <input
        ref={ref}
        className='placeholder:text-lightgray500 disabled:text-lightgray500 font-medium-16 h-[5.6rem] w-full rounded-[16px] bg-white px-[1.6rem] text-black'
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
