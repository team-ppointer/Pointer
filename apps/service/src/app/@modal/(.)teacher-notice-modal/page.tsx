'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { useEffect, useState } from 'react';

import { BaseModalTemplate, RouteModal } from '@components';
import NoticeForm from '@/components/home/NoticeForm';
import postTeacherNotice from '@/apis/controller-teacher/notice/postTeacherNotice';
import { showToast } from '@utils';

type FormValues = {
  startYear: string;
  startMonth: string;
  startDay: string;
  endYear: string;
  endMonth: string;
  endDay: string;
  content: string;
};

const formatDateString = (year: string, month: string, day: string): string => {
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
};

const transformFormData = (data: FormValues) => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId') || '';
  if (!studentId) {
    showToast.error('학생 ID가 없습니다.');
  }

  const startAt = formatDateString(data.startYear, data.startMonth, data.startDay);
  const endAt = formatDateString(data.endYear, data.endMonth, data.endDay);

  return {
    startAt,
    endAt,
    content: data.content,
    studentId: +studentId,
  };
};

const TeacherNoticeModal = () => {
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();

  const methods = useForm<FormValues>({
    mode: 'onChange',
  });

  const { watch, formState } = methods;
  const watchedFields = watch();

  useEffect(() => {
    const { startYear, startMonth, startDay, endYear, endMonth, endDay, content } = watchedFields;
    const hasErrors = Object.keys(formState.errors).length > 0;

    const allFieldsFilled = Boolean(
      startYear && startMonth && startDay && endYear && endMonth && endDay && content
    );

    setIsFormValid(allFieldsFilled && !hasErrors);
  }, [watchedFields, formState.errors]);

  const handleSubmit = async (data: FormValues) => {
    try {
      const transformedData = transformFormData(data);
      await postTeacherNotice(transformedData);
      router.back();
    } catch (error) {
      showToast.error('공지 등록 실패');
      console.error('공지 등록 실패:', error);
    }
  };

  return (
    <RouteModal>
      <BaseModalTemplate>
        <BaseModalTemplate.Content>
          <BaseModalTemplate.Text text='공지 작성' className='font-bold-18 text-black' />
        </BaseModalTemplate.Content>

        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className='flex w-full flex-col gap-[1.6rem]'>
          <FormProvider {...methods}>
            <NoticeForm />
          </FormProvider>

          <BaseModalTemplate.ButtonSection>
            <BaseModalTemplate.Button type='submit' variant='blue'>
              저장
            </BaseModalTemplate.Button>
          </BaseModalTemplate.ButtonSection>
        </form>
      </BaseModalTemplate>
    </RouteModal>
  );
};

export default TeacherNoticeModal;
