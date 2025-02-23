import { postLogin } from '@apis';
import { Button, SearchInput } from '@components';
import { useAuth, useNavigation } from '@hooks';
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
  const { setAccessToken } = useAuth();
  const { mutate } = postLogin();
  const { goPublish } = useNavigation();

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
        credentials: 'include', // 쿠키 포함 요청
      },
      {
        onSuccess: (data) => {
          const { accessToken } = data.data;
          if (accessToken) {
            setAccessToken(accessToken);
            goPublish();
          }
        },
      }
    );
  };

  return (
    <div className='flex h-[100dvh] flex-col items-center justify-center'>
      <img src='/images/logo.jpeg' alt='로고이미지' className='h-[10rem]' />
      <form
        onSubmit={handleSubmit(onSubmitLogin)}
        className='mt-[4.8rem] flex w-[42.4rem] flex-col items-start justify-center gap-[4.8rem]'>
        <SearchInput
          label='아이디'
          sizeType='long'
          placeholder='이메일을 입력해주세요'
          type='email'
          autoComplete='username'
          {...register('email', {
            required: true,
          })}
        />
        <div>
          <SearchInput
            label='비밀번호'
            sizeType='long'
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
            <p className='font-medium-16 text-red mt-[1.2rem]' role='alert'>
              {errors.password.message}
            </p>
          )}
        </div>
        <Button sizeType='full' variant='dark'>
          로그인
        </Button>
      </form>
    </div>
  );
}
