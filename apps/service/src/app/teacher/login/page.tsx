'use client';
import { useRouter } from 'next/navigation';

import { LogoLogin } from '@/assets/svg/logo';
import TeacherLoginForm from '@/components/login/TeacherLoginForm';

const Page = () => {
  const router = useRouter();

  const handleLoginClick = async (social: 'KAKAO' | 'GOOGLE') => {};

  return (
    <div className='mx-auto flex h-[100dvh] w-full flex-col justify-center gap-[6.4rem] bg-white px-[2rem]'>
      <div className='mt-[6.4rem] flex flex-col items-center'>
        <p className='font-medium-16 text-center text-black'>
          진단과 학습은 꼼꼼하게
          <br />
          성적 향상은 빠르게
        </p>
        <LogoLogin width={250} height={57} className='mt-[2.4rem]' />
        <h1 className='text-main font-bold-24 mt-[1.6rem]'>포인터</h1>
      </div>
      <TeacherLoginForm />
    </div>
  );
};

export default Page;
