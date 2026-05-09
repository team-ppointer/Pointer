import { SubmitHandler, useForm } from 'react-hook-form';
import { postLogin } from '@apis';
import { Input } from '@components';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { adminSessionStorage, silentLogout, tokenStorage } from '@utils';
import { Mail, Lock, LogIn } from 'lucide-react';

import { getFirstAccessibleRoute, toAdminSession } from '@/constants/adminPermissions';

export const Route = createFileRoute('/login/')({
  beforeLoad: async () => {
    if (tokenStorage.getToken() && adminSessionStorage.getSession()) {
      const firstAccessibleRoute = getFirstAccessibleRoute(adminSessionStorage.getSession());

      if (!firstAccessibleRoute) {
        silentLogout();
        return;
      }

      throw redirect({
        to: firstAccessibleRoute,
      });
    }
  },
  component: RouteComponent,
});

interface LoginType {
  email: string;
  password: string;
}

function RouteComponent() {
  const { mutate, isPending } = postLogin();
  const router = useRouter();

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
          const { accessToken } = data.token;
          if (accessToken) {
            const adminSession = toAdminSession(data);
            const firstAccessibleRoute = getFirstAccessibleRoute(adminSession);

            if (!firstAccessibleRoute) {
              silentLogout();
              return;
            }

            tokenStorage.setToken(accessToken);
            adminSessionStorage.setSession(adminSession);
            router.navigate({ to: firstAccessibleRoute });
          }
        },
      }
    );
  };

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-gray-50 p-6'>
      <div className='animate-in fade-in slide-in-from-bottom-4 w-full max-w-5xl duration-700'>
        <div className='grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:grid-cols-2'>
          {/* 왼쪽 브랜딩 패널 */}
          <div className='bg-main/5 flex flex-col justify-between p-8 md:p-12'>
            <div className='flex flex-col items-start gap-4'>
              <img src='/images/logo.png' alt='Pointer 로고' className='aspect-auto h-8' />
              <div className='mt-2 flex flex-col gap-3'>
                <h1 className='text-2xl font-bold text-gray-900'>관리자 시스템</h1>
                <p className='text-sm text-gray-600'>
                  효율적인 학습 관리를 위한
                  <br />
                  Pointer Admin 플랫폼
                </p>
              </div>
            </div>

            {/* 하단 텍스트 */}
            <div className='mt-8 border-t border-gray-200 pt-6'>
              <p className='text-xs text-gray-500'>© 2025 Pointer. All rights reserved.</p>
            </div>
          </div>

          {/* 오른쪽 로그인 폼 */}
          <div className='flex flex-col justify-center p-8 md:p-12'>
            <div className='mb-8'>
              <h2 className='text-xl font-bold text-gray-900'>로그인</h2>
              <p className='mt-2 text-sm text-gray-500'>계정 정보를 입력해주세요</p>
            </div>

            <form onSubmit={handleSubmit(onSubmitLogin)} className='flex flex-col gap-6'>
              {/* 이메일 입력 */}
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='email'
                  className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                  <Mail className='h-4 w-4 text-gray-600' />
                  이메일
                </label>
                <Input
                  id='email'
                  type='email'
                  placeholder='example@pointer.com'
                  autoComplete='username'
                  {...register('email', {
                    required: '이메일을 입력해주세요',
                  })}
                  className={errors.email ? 'border-red-600 focus:border-red-600' : ''}
                />
                {errors.email && (
                  <p className='text-sm font-medium text-red-600' role='alert'>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='password'
                  className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                  <Lock className='h-4 w-4 text-gray-600' />
                  비밀번호
                </label>
                <Input
                  id='password'
                  type='password'
                  placeholder='비밀번호를 입력해주세요'
                  autoComplete='current-password'
                  lang='en'
                  inputMode='text'
                  {...register('password', {
                    required: '비밀번호를 입력해주세요',
                  })}
                  className={errors.password ? 'border-red-600 focus:border-red-600' : ''}
                />
                {errors.password && (
                  <p className='text-sm font-medium text-red-600' role='alert'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* 로그인 버튼 */}
              <button
                type='submit'
                disabled={isPending}
                className='bg-main hover:bg-main/90 mt-2 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'>
                {isPending ? (
                  <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  <>
                    <LogIn className='h-4 w-4' />
                    로그인
                  </>
                )}
              </button>
            </form>

            {/* 추가 정보 */}
            <p className='mt-8 text-center text-xs text-gray-500'>
              문제가 있으신가요? 관리자에게 문의해주세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
