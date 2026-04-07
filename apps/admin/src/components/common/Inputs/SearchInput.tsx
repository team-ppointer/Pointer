import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { IcPreviewButton } from '@svg';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  sizeType?: 'short' | 'long' | 'full';
  label?: string;
  showPasswordToggle?: boolean;
}

const sizeStyles = {
  short: 'w-full max-w-[24.8rem] h-[4.0rem]',
  long: 'w-full max-w-[42.4rem] h-[4.0rem]',
  full: 'w-full h-[4.0rem]',
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ sizeType = 'short', label, showPasswordToggle = false, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputType =
      showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className='flex w-full flex-col gap-[0.6rem]'>
        {label && <span className='font-14b-title text-black'>{label}</span>}
        <div
          className={`relative flex items-center ${sizeStyles[sizeType]} font-14m-body border-lightgray500 rounded-[0.8rem] border bg-white px-400 text-black focus-within:outline-2 focus-within:outline-blue-500`}>
          <input
            ref={ref}
            type={inputType}
            className='placeholder:text-lightgray500 h-full flex-1 focus:outline-none'
            {...props}
          />
          {showPasswordToggle && type === 'password' && (
            <button type='button' onClick={togglePasswordVisibility}>
              <IcPreviewButton className='h-[3.6rem] w-[3.6rem]' />
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default SearchInput;
