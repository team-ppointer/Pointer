import { UseFormStateReturn, UseFormRegister } from 'react-hook-form';

import { UserInfoFormData } from '@/types';
import { GRADE_VALIDATION_RULES, NAME_VALIDATION_RULES } from '@/constants/validationRules';

import UserInfoInput from '../common/Inputs/UserInfoInput';

type UserInfoFormProps = {
  formState: UseFormStateReturn<UserInfoFormData>;
  register: UseFormRegister<UserInfoFormData>;
};

const UserInfoForm = ({ formState, register }: UserInfoFormProps) => {
  return (
    <>
      <div className='flex w-full flex-col gap-[0.8rem]'>
        <p className='font-medium-16 text-black'>이름이 무엇인가요?</p>
        <UserInfoInput
          type='name'
          error={!!formState.errors.name}
          {...register('name', NAME_VALIDATION_RULES)}
        />
      </div>
      <div className='flex w-full flex-col gap-[0.8rem]'>
        <p className='font-medium-16 text-black'>몇학년인가요?</p>
        <UserInfoInput
          type='grade'
          error={!!formState.errors.grade}
          {...register('grade', GRADE_VALIDATION_RULES)}
        />
      </div>
    </>
  );
};

export default UserInfoForm;
