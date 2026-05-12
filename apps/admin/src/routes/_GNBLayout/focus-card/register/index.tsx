import { postFocusCard } from '@apis';
import { Button, Header } from '@components';
import { useInvalidate } from '@hooks';
import { getEmptyContentString } from '@utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Slide, toast, ToastContainer } from 'react-toastify';

import EditorField from '@/components/problem/EditorField';
import { FocusCardActionNodePicker } from '@/components/focusCard';

export const Route = createFileRoute('/_GNBLayout/focus-card/register/')({
  component: RouteComponent,
});

interface FormValues {
  actionNodeId?: number;
  title: string;
  description: string;
  content: string;
}

function RouteComponent() {
  const navigate = useNavigate();
  const { invalidateFocusCardList } = useInvalidate();
  const { mutate, isPending } = postFocusCard();

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      actionNodeId: undefined,
      title: getEmptyContentString(),
      description: getEmptyContentString(),
      content: getEmptyContentString(),
    },
  });

  const [actionNodeError, setActionNodeError] = useState(false);
  const actionNodeId = watch('actionNodeId');

  const onSubmit = handleSubmit((data) => {
    if (!data.actionNodeId) {
      setActionNodeError(true);
      toast.error('Action Node를 선택해 주세요');
      return;
    }
    setActionNodeError(false);

    mutate(
      {
        body: {
          actionNodeId: data.actionNodeId,
          title: data.title,
          description: data.description,
          content: data.content,
        },
      },
      {
        onSuccess: () => {
          invalidateFocusCardList();
          toast.success('카드가 생성되었습니다');
          navigate({ to: '/focus-card' });
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  });

  return (
    <>
      <ToastContainer
        position='top-center'
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme='light'
        transition={Slide}
      />
      <div className='min-h-screen bg-gray-50'>
        <Header title='집중학습 카드 생성'>
          <Header.Button Icon={Save} color='main' onClick={onSubmit}>
            {isPending ? '저장 중...' : '저장'}
          </Header.Button>
        </Header>
        <form
          className='mx-auto max-w-4xl space-y-6 px-8 pb-12'
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}>
          <section className='space-y-2 rounded-2xl border border-gray-200 bg-white p-6'>
            <label className='block text-sm font-semibold text-gray-700'>Action Node</label>
            <FocusCardActionNodePicker
              value={actionNodeId}
              onChange={(id) => {
                setValue('actionNodeId', id);
                if (id !== undefined) setActionNodeError(false);
              }}
              hasError={actionNodeError}
            />
            <p className='text-xs text-gray-400'>
              아직 집중학습 카드가 등록되지 않은 Action 노드만 표시됩니다.
            </p>
          </section>

          <section className='space-y-2 rounded-2xl border border-gray-200 bg-white p-6'>
            <label className='block text-sm font-semibold text-gray-700'>제목</label>
            <EditorField control={control} name='title' />
          </section>

          <section className='space-y-2 rounded-2xl border border-gray-200 bg-white p-6'>
            <label className='block text-sm font-semibold text-gray-700'>설명</label>
            <EditorField control={control} name='description' />
          </section>

          <section className='space-y-2 rounded-2xl border border-gray-200 bg-white p-6'>
            <label className='block text-sm font-semibold text-gray-700'>본문</label>
            <EditorField control={control} name='content' />
          </section>

          <div className='flex justify-end'>
            <Button type='submit' variant='primary' sizeType='md' disabled={isPending}>
              {isPending ? '저장 중...' : '카드 생성'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
