import { IcKakao } from '@svg';

const KakaoButton = () => {
  return (
    <button className='flex h-[5.6rem] w-full items-center justify-center gap-[0.8rem] rounded-[1.6rem] bg-[#FEE500]'>
      <IcKakao width={24} height={24} />
      <p className='font-medium-16 text-black'>카카오로 계속하기</p>
    </button>
  );
};

export default KakaoButton;
