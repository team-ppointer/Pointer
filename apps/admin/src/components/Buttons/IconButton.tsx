import { ButtonHTMLAttributes } from 'react';
import {
  IcLeftButton,
  IcRightButton,
  IcViewButton,
  IcPreviewButton,
  IcModifyButton,
  IcDeleteButton,
  IcSelectButton,
  IcUnselectedButton,
} from '@svg';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'left' | 'right' | 'view' | 'preview' | 'modify' | 'delete' | 'select' | 'unselected';
}

const IconButton = ({ variant, onClick, ...props }: IconButtonProps) => {
  const icons = {
    left: <IcLeftButton width={36} height={36} />,
    right: <IcRightButton width={36} height={36} />,
    view: <IcViewButton width={36} height={36} />,
    preview: <IcPreviewButton width={36} height={36} />,
    modify: <IcModifyButton width={36} height={36} />,
    delete: <IcDeleteButton width={36} height={36} />,
    select: <IcSelectButton width={36} height={36} />,
    unselected: <IcUnselectedButton width={36} height={36} />,
  };

  return (
    <button onClick={onClick} {...props}>
      {icons[variant]}
    </button>
  );
};

export default IconButton;
