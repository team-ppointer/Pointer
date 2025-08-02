'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button, Header } from '@components';
import { setName, setGrade, showToast } from '@utils';
import UserInfoForm from '@/components/onboarding/UserInfoForm';
import putUserInfo from '@/apis/controller/auth/putUserInfo';

const Page = () => {
  type FormValues = { name: string; grade: string };
  const router = useRouter();
  const [isFormFilled, setIsFormFilled] = useState(false);

  const methods = useForm<FormValues>({
    mode: 'onChange',
  });
  const { register, formState, getFieldState } = methods;
  const handleSubmitForm = async () => {
    const result = await putUserInfo(methods.getValues('name'), Number(methods.getValues('grade')));
    if (result.isSuccess) {
      if (result.data) {
        setName(result.data.name);
        setGrade(result.data.grade);
      }
      router.push('/');
    } else {
      showToast.error('회원 정보 수정에 실패했습니다. 다시 시도해주세요.');
      router.push('/login');
    }
  };

  useEffect(() => {
    const isNameValid = getFieldState('name', formState);
    const isGradeValid = getFieldState('grade', formState);

    if (!isNameValid.invalid && !isGradeValid.invalid) {
      setIsFormFilled(true);
    } else {
      setIsFormFilled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);
  return (
    <>
      <Header title='회원 정보 수정' iconType='back' />
      <main className='flex h-dvh flex-col items-center justify-between px-[2rem] pt-[8rem] pb-[1.5rem]'>
        <FormProvider {...methods}>
          <div className='flex w-full flex-col items-start justify-start gap-[3.2rem]'>
            <UserInfoForm formState={formState} register={register} type='edit' />
          </div>
          <Button type='submit' variant='blue' disabled={!isFormFilled} onClick={handleSubmitForm}>
            수정 완료
          </Button>
        </FormProvider>
      </main>
    </>
  );
};

export default Page;
