'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { ID_VALIDATION_RULES, PASSWORD_VALIDATION_RULES } from '@/constants/validationRules';
import { Button, Input } from '@components';
import { IcAlert } from '@svg';
import { postLogin } from '@/apis/controller-teacher';
import { setTeacherAccessToken, setTeacherRefreshToken } from '@utils';

const TeacherLoginForm = () => {
  const router = useRouter();
  const methods = useForm<{
    email: string;
    password: string;
  }>({
    mode: 'onChange',
  });
  const { register, formState } = methods;

  const handleSubmit = async (data: { email: string; password: string }) => {
    const response = await postLogin(data);
    if (response.response.status === 200) {
      setTeacherAccessToken(response.data?.token?.accessToken ?? '');
      setTeacherRefreshToken(response.data?.token?.refreshToken ?? '');
      router.push('/teacher');
    }
  };

  return (
    <form className='flex w-full flex-col gap-[0.8rem]' onSubmit={(e) => e.preventDefault()}>
      <div className='text-red font-medium-12 flex items-center justify-start gap-[0.4rem]'>
        <IcAlert width={16} height={16} />
        <p>아이디 또는 비밀번호를 확인해주세요</p>
      </div>

      <Input
        className='bg-background font-medium-16 placeholder:text-lightgray500 w-full rounded-[1.6rem] p-[1.6rem] focus:outline-0'
        type='id'
        {...register('id', ID_VALIDATION_RULES)}
        placeholder='아이디를 입력해주세요'
      />
      <Input
        className='bg-background font-medium-16 placeholder:text-lightgray500 w-full rounded-[1.6rem] p-[1.6rem] focus:outline-0'
        type='password'
        {...register('password', PASSWORD_VALIDATION_RULES)}
        placeholder='비밀번호를 입력해주세요'
      />
      <Button
        onClick={() => handleSubmit(methods.getValues())}
        className='bg-main font-bold-16 w-full rounded-[0.4rem] py-[1.2rem] text-white'>
        로그인
      </Button>
    </form>
  );
};

export default TeacherLoginForm;
