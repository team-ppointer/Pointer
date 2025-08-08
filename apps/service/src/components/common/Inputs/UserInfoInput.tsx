'use client';
import { forwardRef } from 'react';
import clsx from 'clsx';

import { Input } from '@components';
import { getGrade, getName } from '@utils';

interface UserInfoInputProps {
  type?: 'name' | 'grade';
  error?: boolean;
}

const UserInfoInput = forwardRef<HTMLInputElement, UserInfoInputProps>(
  ({ type, error = false, ...props }, ref) => {
    const defaultName = getName() || '';
    const defaultGrade = getGrade() || '';
    return (
      <div className='flex w-full flex-col gap-[0.8rem]'>
        {type === 'name' && (
          <Input ref={ref} placeholder='예) 홍길동' {...props} defaultValue={defaultName} />
        )}
        {type === 'grade' && (
          <Input ref={ref} placeholder='예) 3' {...props} defaultValue={defaultGrade} />
        )}
        <p className={clsx('font-medium-14', error ? 'text-red' : 'text-lightgray500')}>
          {type === 'name' && '2자 이상, 5자 이하로 입력해주세요'}
          {type === 'grade' && '1~3 사이 숫자만 입력해주세요'}
        </p>
      </div>
    );
  }
);

UserInfoInput.displayName = 'UserInfoInput';

export default UserInfoInput;
