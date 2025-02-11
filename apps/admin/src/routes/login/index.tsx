import { postLogin } from '@apis';
import { Button, Input } from '@components';
import { createFileRoute } from '@tanstack/react-router';
import { SubmitHandler, useForm } from 'react-hook-form';

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
});

interface LoginType {
  email: string;
  password: string;
}

function RouteComponent() {
  const { mutate } = postLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>();

  const onSubmitLogin: SubmitHandler<LoginType> = async (formData) => {
    mutate(
      {
        body: {
          ...formData,
        },
      },
      {
        onSuccess: (data) => {
          if (data) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.accessToken);
          }
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitLogin)}
      className='mt-[20rem] flex flex-col items-center justify-center gap-[1rem]'>
      <h1 className='font-bold-24'>관리자 로그인</h1>
      <Input
        placeholder='이메일을 입력해주세요'
        type='email'
        autoComplete='username'
        {...register('email', {
          required: true,
        })}
      />
      <Input
        placeholder='비밀번호를 입력해주세요'
        type='password'
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
        <p className='font-medium-16 text-red' role='alert'>
          {errors.password.message}
        </p>
      )}

      <Button sizeType='long'>로그인</Button>
    </form>
  );
}
