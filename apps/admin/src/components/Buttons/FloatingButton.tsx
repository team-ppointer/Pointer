import { ButtonHTMLAttributes } from 'react';

import Button from './Button';

interface FloatingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const FloatingButton = ({ onClick, disabled, children, ...props }: FloatingButtonProps) => {
  return (
    <div className='fixed bottom-[6rem] left-[calc(50%+12rem)] z-50 translate-x-[-50%] drop-shadow-lg'>
      <Button sizeType='long' variant='dark' disabled={disabled} onClick={onClick} {...props}>
        {children}
      </Button>
    </div>
  );
};
export default FloatingButton;
