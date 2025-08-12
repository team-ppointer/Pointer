import { forwardRef, TextareaHTMLAttributes } from 'react';

const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className='placeholder:text-lightgray500 font-medium-18 bg-background rounded-400 h-fit min-h-[18.4rem] w-full p-800 text-black'
        {...props}
      />
    );
  }
);

export default TextArea;
