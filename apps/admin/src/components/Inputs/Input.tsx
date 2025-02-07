import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ ...props }, ref) => {
    return (
      <input
        ref={ref}
        className='placeholder:text-lightgray500 font-bold-24 border-lightgray500 h-[5.2rem] w-[70.2rem] rounded-[16px] border bg-white px-[1.6rem] text-black'
        {...props}
      />
    );
  }
);

export default Input;
