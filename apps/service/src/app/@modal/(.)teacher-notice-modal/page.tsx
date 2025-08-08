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

// studentId를 파라미터로 받도록 수정
const transformFormData = (data: FormValues, studentId: number) => {
  const startAt = formatDateString(data.startYear, data.startMonth, data.startDay);
  const endAt = formatDateString(data.endYear, data.endMonth, data.endDay);

  return {
    startAt,
    endAt,
    content: data.content,
    studentId,
  };
};

const TeacherNoticeModal = () => {
  const [, setIsFormValid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // 컴포넌트 레벨에서 hook 사용

  const methods = useForm<FormValues>({
    mode: 'onChange',
  });

  const { watch, formState } = methods;
  const watchedFields = watch();

  useEffect(() => {
    const { startYear, startMonth, startDay, endYear, endMonth, endDay } = watchedFields;
    const hasErrors = Object.keys(formState.errors).length > 0;

    // content는 이제 선택사항이므로 제외
    const allRequiredFieldsFilled = Boolean(
      startYear && startMonth && startDay && endYear && endMonth && endDay
    );

    setIsFormValid(allRequiredFieldsFilled && !hasErrors);
  }, [watchedFields, formState.errors]);

  const handleSubmit = async (data: FormValues) => {
    try {
      const studentId = searchParams.get('studentId');

      if (!studentId) {
        showToast.error('학생 ID가 없습니다.');
        return;
      }

      const transformedData = transformFormData(data, +studentId);
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
