'use client';
import { postLogin } from '@apis';
import { Button, Input } from '@components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { LogoLogin } from '@/assets/svg/logo';
import { setAccessToken } from '@/contexts/AuthContext';

interface LoginType {
  email: string;
  password: string;
}

const Page = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>();

  const onSubmitLogin: SubmitHandler<LoginType> = async (formData) => {
    const { data } = await postLogin(formData.email, formData.password);

    const { accessToken } = data?.data || {};
    if (accessToken) {
      setAccessToken(accessToken);
      router.push('/');
    }
  };

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
      {/* <div className='mt-auto flex flex-col items-center gap-[1.6rem]'>
        <p className='font-medium-12 text-lightgray500'>포인터는 태블릿의 스플릿뷰를 권장해요</p>
        <KakaoButton />
        <AppleButton />
      </div> */}
      <form
        onSubmit={handleSubmit(onSubmitLogin)}
        className='mt-[4.8rem] flex flex-col items-start justify-center gap-[2.4rem]'>
        <Input
          type='email'
          placeholder='이메일을 입력해주세요'
          autoComplete='username'
          {...register('email', {
            required: true,
          })}
        />
        <Input
          type='password'
          placeholder='비밀번호를 입력해주세요'
          autoComplete='current-password'
          {...register('password', {
            required: true,
            pattern: {
              value: /^[A-Za-z0-9]*$/,
              message: '비밀번호는 영문자와 숫자만 입력 가능합니다.',
            },
          })}
        />
        {errors.password && (
          <p className='font-medium-16 text-red mt-[1.2rem]' role='alert'>
            {errors.password.message}
          </p>
        )}
        <Button variant='blue'>로그인</Button>
      </form>
    </div>
  );
};

export default Page;
