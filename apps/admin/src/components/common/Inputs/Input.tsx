import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`placeholder:text-lightgray500 disabled:text-lightgray500 font-bold-18 border-lightgray500 rounded-400 h-[5.2rem] w-full border bg-white px-400 text-black ${props.className}`}
        {...props}
      />
    );
  }
);

export default Input;
