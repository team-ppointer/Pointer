import { forwardRef, TextareaHTMLAttributes } from 'react';

const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`focus:border-main focus:ring-main/20 min-h-[180px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${className ?? ''}`}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
