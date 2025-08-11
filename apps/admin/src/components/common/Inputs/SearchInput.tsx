import { InputHTMLAttributes, forwardRef } from 'react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  sizeType?: 'short' | 'long' | 'full';
  label?: string;
}

const sizeStyles = {
  short: 'w-[24.8rem] h-[5.6rem]',
  long: 'w-[42.4rem] h-[5.6rem]',
  full: 'w-full h-[5.6rem]',
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ sizeType = 'short', label, ...props }, ref) => {
    return (
      <div className='flex flex-col gap-300'>
        {label && <span className='font-medium-18 text-black'>{label}</span>}
        <div className={` ${sizeStyles[sizeType]}`}>
          <input
            ref={ref}
            className='font-medium-18 placeholder:text-lightgray500 border-lightgray500 rounded-400 h-full w-full border bg-white px-400 text-black'
            {...props}
          />
        </div>
      </div>
    );
  }
);

export default SearchInput;
