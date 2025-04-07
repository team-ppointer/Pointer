import { forwardRef, TextareaHTMLAttributes } from 'react';

const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className='placeholder:text-lightgray500 font-medium-18 bg-background h-fit min-h-[18.4rem] w-full rounded-[16px] p-[3.2rem] text-black'
        {...props}
      />
    );
  }
);

export default TextArea;
