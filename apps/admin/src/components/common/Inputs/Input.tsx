import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        {...rest}
        className={`placeholder:text-lightgray500 disabled:text-lightgray500 font-bold-18 border-lightgray500 rounded-400 h-[5.2rem] w-full border bg-white px-400 text-black ${className ?? ''}`}
      />
    );
  }
);

export default Input;
