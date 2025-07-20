'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button, Header } from '@components';
import { postUserInfo } from '@/apis/controller/auth';
import { setName, setGrade } from '@utils';
import UserInfoForm from '@/components/onboarding/UserInfoForm';

const Page = () => {
  type FormValues = { name: string; grade: string };
  const router = useRouter();
  const [isFormFilled, setIsFormFilled] = useState(false);

  const methods = useForm<FormValues>({
    mode: 'onChange',
  });
  const { register, formState, getFieldState } = methods;
  const handleSubmitForm = async () => {
    const result = await postUserInfo(
      methods.getValues('name'),
      Number(methods.getValues('grade'))
    );
    if (result.isSuccess) {
      if (result.data) {
        setName(result.data.name);
        setGrade(result.data.grade);
      }
      router.push('/');
    } else {
      console.error('회원 정보 입력 실패:', result.error);
      router.push('/login');
    }
  };

  useEffect(() => {
    const isNameValid = getFieldState('name', formState);
    const isGradeValid = getFieldState('grade', formState);

    if (
      !isNameValid.invalid &&
      !isGradeValid.invalid &&
      isNameValid.isDirty &&
      isGradeValid.isDirty
    ) {
      setIsFormFilled(true);
    } else {
      setIsFormFilled(false);
    }
  }, [formState, methods]);

  return (
    <>
      <Header title='회원 정보 입력' iconType='none' />
      <main className='flex h-dvh flex-col items-center justify-between px-[2rem] pt-[8rem] pb-[1.5rem]'>
        <FormProvider {...methods}>
          <div className='flex w-full flex-col items-start justify-start gap-[3.2rem]'>
            <p className='font-bold-24 text-black'>
              <span className='text-main'>포인터</span>
              에 오신 걸 <br />
              환영합니다!
            </p>
            <UserInfoForm formState={formState} register={register} />
          </div>
          <Button type='submit' variant='blue' disabled={!isFormFilled} onClick={handleSubmitForm}>
            완료
          </Button>
        </FormProvider>
      </main>
    </>
  );
};

export default Page;
