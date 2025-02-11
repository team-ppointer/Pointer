import Button from './Button';

interface FloatingButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

const FloatingButton = ({ onClick, children }: FloatingButtonProps) => {
  return (
    <div className='fixed bottom-[6rem] left-[calc(50%+12rem)] z-50 translate-x-[-50%] drop-shadow-lg'>
      <Button sizeType='long' variant='dark' onClick={onClick}>
        {children}
      </Button>
    </div>
  );
};
export default FloatingButton;
