import { useFormContext } from 'react-hook-form';

import { IcAlert } from '@svg';

type DateInputProps = {
  yearField: string;
  monthField: string;
  dayField: string;
  label: string;
};

const DateInput = ({ yearField, monthField, dayField, label }: DateInputProps) => {
  const { register, watch } = useFormContext();

  const validateEndDate = () => {
    const watchedValues = watch();
    const { startYear, startMonth, startDay, endYear, endMonth, endDay } = watchedValues;

    if (startYear && startMonth && startDay && endYear && endMonth && endDay) {
      const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
      const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));

      if (endDate <= startDate) {
        return '날짜를 정확히 입력해주세요';
      }
    }
    return true;
  };

  const isEndDateField = dayField === 'endDay';

  return (
    <div className='flex flex-row items-center gap-[1.2rem]'>
      <div className='flex flex-row items-center gap-[0.4rem]'>
        <input
          {...register(yearField, {
            required: '년도를 입력해주세요',
            pattern: {
              value: /^\d{4}$/,
              message: '올바른 년도를 입력해주세요',
            },
            ...(isEndDateField && { validate: validateEndDate }),
          })}
          placeholder='YYYY'
          maxLength={4}
          inputMode='numeric'
          className='placeholder:text-gray500 bg-background h-[4rem] w-[5.8rem] [appearance:textfield] rounded-[0.8rem] px-[0.8rem] text-center focus:border-none focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        />
        <span>년</span>
      </div>
      <div className='flex flex-row items-center gap-[0.4rem]'>
        <input
          {...register(monthField, {
            required: '월을 입력해주세요',
            pattern: {
              value: /^(0?[1-9]|1[0-2])$/,
              message: '올바른 월을 입력해주세요 (1-12)',
            },
            ...(isEndDateField && { validate: validateEndDate }),
          })}
          placeholder='MM'
          maxLength={2}
          inputMode='numeric'
          className='placeholder:text-gray500 bg-background h-[4rem] w-[4.4rem] [appearance:textfield] rounded-[0.8rem] px-[0.8rem] text-center focus:border-none focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        />
        <span>월</span>
      </div>
      <div className='flex flex-row items-center gap-[0.4rem]'>
        <input
          {...register(dayField, {
            required: '일을 입력해주세요',
            pattern: {
              value: /^(0?[1-9]|[12]\d|3[01])$/,
              message: '올바른 일을 입력해주세요 (1-31)',
            },
            ...(isEndDateField && { validate: validateEndDate }),
          })}
          placeholder='DD'
          maxLength={2}
          inputMode='numeric'
          className='placeholder:text-gray500 bg-background h-[4rem] w-[4.4rem] [appearance:textfield] rounded-[0.8rem] px-[0.8rem] text-center focus:border-none focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        />
        <span className='whitespace-nowrap'>{label}</span>
      </div>
    </div>
  );
};

const NoticeForm = () => {
  const { register, formState } = useFormContext();
  const { errors, isSubmitted } = formState;

  const hasDateErrors = Boolean(
    errors.startYear ||
      errors.startMonth ||
      errors.startDay ||
      errors.endYear ||
      errors.endMonth ||
      errors.endDay
  );

  return (
    <>
      <div className='flex w-full flex-col gap-[1.2rem]'>
        <DateInput
          yearField='startYear'
          monthField='startMonth'
          dayField='startDay'
          label='일 부터'
        />
        <DateInput yearField='endYear' monthField='endMonth' dayField='endDay' label='일 까지' />

        {isSubmitted && hasDateErrors && (
          <div className='text-red flex flex-row gap-[0.4rem]'>
            <IcAlert width={16} height={16} />
            <p className='text-red font-medium-12'>날짜를 정확히 입력해주세요</p>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-[0.8rem]'>
        <textarea
          {...register('content')}
          className='bg-background placeholder:text-gray500 font-medium-16 h-[14.4rem] resize-none scroll-auto rounded-[1.6rem] border-none p-[2rem] text-black outline-none focus:border-none focus:outline-none'
          placeholder='내용을 입력해주세요'
        />
      </div>
    </>
  );
};

export default NoticeForm;
