import { useNavigation } from '@hooks';
import { IcLeftSm } from '@svg';
import { ButtonHTMLAttributes } from 'react';

const PrevPageButton = ({ ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { goBack } = useNavigation();
  return (
    <button
      className='bg-darkgray100 flex h-[3.6rem] w-[15rem] items-center justify-center gap-[1.2rem] rounded-[4px] text-white'
      onClick={goBack}
      {...props}>
      <IcLeftSm width={8} height={16} />
      <span className='font-medium-16'>이전 페이지 가기</span>
    </button>
  );
};

export default PrevPageButton;
