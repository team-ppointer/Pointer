import React from 'react';
import { ButtonHTMLAttributes } from 'react';
// Import icon components
import {
  IcLeft,
  IcRight,
  IcView,
  IcPreview,
  IcModify,
  IcDelete,
  IcSelect,
  IcUnselected,
} from '@svg';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'left' | 'right' | 'view' | 'preview' | 'modify' | 'delete' | 'select' | 'unselected';
}

const IconButton: React.FC<IconButtonProps> = ({ variant, className, onClick, ...props }) => {
  const baseStyles = 'w-[3.6rem] h-[3.6rem] rounded-[4px] flex items-center justify-center';

  const variantStyles = {
    left: 'bg-darkgray100',
    right: 'bg-darkgray100',
    view: 'bg-lightgreen',
    preview: 'bg-lightgray300',
    modify: 'bg-lightblue',
    delete: 'bg-lightred',
    select: 'bg-blue',
    unselected: 'bg-lightgray300',
  };

  const icons = {
    left: <IcLeft width={11} height={21} />,
    right: <IcRight width={11} height={21} />,
    view: <IcView width={24} height={24} />,
    preview: <IcPreview width={24} height={24} />,
    modify: <IcModify width={24} height={24} />,
    delete: <IcDelete width={24} height={24} />,
    select: <IcSelect width={24} height={24} />,
    unselected: <IcUnselected width={24} height={24} />,
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      {...props}>
      {icons[variant]}
    </button>
  );
};

export default IconButton;
