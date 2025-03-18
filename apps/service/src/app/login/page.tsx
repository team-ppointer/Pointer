import { LogoLogin } from '@/assets/svg/logo';
import { AppleButton } from '@/components/login';
import { KakaoButton } from '@/components/login';

const Page = () => {
  return (
    <div className='mx-auto flex h-[100dvh] w-[33.5rem] flex-col pb-[2rem]'>
      <div className='flex flex-col items-center py-[9.6rem]'>
        <p className='font-medium-16 text-center text-black'>
          손해설부터 처방까지
          <br />
          수학 문제 풀이 사고력을 위해
        </p>
        <LogoLogin width={250} height={57} className='mt-[2.4rem]' />
        <h1 className='text-main font-bold-24 mt-[1.6rem]'>포인터</h1>
      </div>
      <div className='mt-auto flex flex-col items-center gap-[1.6rem]'>
        <p className='font-medium-12 text-lightgray500'>포인터는 태블릿의 스플릿뷰를 권장해요</p>
        <KakaoButton />
        <AppleButton />
      </div>
    </div>
  );
};

export default Page;
