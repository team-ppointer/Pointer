import { IcCopy } from '@svg';

interface CopyButtonProps {
  onClick: () => void;
}

const CopyButton = ({ onClick }: CopyButtonProps) => {
  return (
    <button type='button' onClick={onClick}>
      <IcCopy width={24} height={24} />
    </button>
  );
};

export default CopyButton;
