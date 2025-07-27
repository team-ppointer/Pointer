import { IcGoogle } from '@svg';

interface GoogleButtonProps {
  onClick: () => void;
}

const GoogleButton = ({ onClick }: GoogleButtonProps) => {
  return (
    <button
      className='flex h-[5.6rem] w-full items-center justify-center gap-[0.8rem] rounded-[1.6rem] bg-[#F2F2F2]'
      onClick={onClick}>
      <IcGoogle width={20} height={20} />
      <p className='font-medium-16 text-black'>Google로 계속하기</p>
    </button>
  );
};

export default GoogleButton;
