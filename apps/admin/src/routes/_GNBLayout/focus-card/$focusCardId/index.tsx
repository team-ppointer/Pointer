import { deleteFocusCard, getFocusCardById, postFocusCardContent } from '@apis';
import { Button, Header, Modal, TwoButtonModalTemplate } from '@components';
import { useActionNodeDetail, useInvalidate, useModal } from '@hooks';
import { InlineProblemViewer } from '@repo/pointer-editor-v2';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Save, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { getEmptyContentString } from '@utils';

import EditorField from '@/components/problem/EditorField';

import '@repo/pointer-editor-v2/style.css';

export const Route = createFileRoute('/_GNBLayout/focus-card/$focusCardId/')({
  component: RouteComponent,
});

interface FormValues {
  title: string;
  description: string;
  content: string;
}

function RouteComponent() {
  const navigate = useNavigate();
  const { focusCardId } = Route.useParams();
  const id = Number(focusCardId);

  const { invalidateFocusCard, invalidateFocusCardList } = useInvalidate();
  const { data: card, isLoading } = getFocusCardById(id);
  const actionNodeDetail = useActionNodeDetail(card?.actionNode.id);
  const { mutate: mutateUpdate, isPending: isUpdating } = postFocusCardContent();
  const { mutate: mutateDelete } = deleteFocusCard();

  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      title: getEmptyContentString(),
      description: getEmptyContentString(),
      content: getEmptyContentString(),
    },
  });

  useEffect(() => {
    if (!card) return;
    reset({
      title: card.title,
      description: card.description,
      content: card.content,
    });
  }, [card, reset]);

  const onSubmit = handleSubmit((data) => {
    mutateUpdate(
      {
        params: { path: { id } },
        body: {
          title: data.title,
          description: data.description,
          content: data.content,
        },
      },
      {
        onSuccess: () => {
          invalidateFocusCard(id);
          toast.success('카드 내용이 저장되었습니다');
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  });

  const handleConfirmDelete = () => {
    mutateDelete(
      { params: { path: { id } } },
      {
        onSuccess: () => {
          invalidateFocusCardList();
          toast.success('카드가 삭제되었습니다');
          navigate({ to: '/focus-card' });
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
    closeDeleteModal();
  };

  if (isLoading || !card) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-sm text-gray-400'>불러오는 중...</p>
      </div>
    );
  }

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
        <Header title='집중학습 카드 수정'>
          <div className='flex items-center gap-2'>
            <Header.Button Icon={Trash2} color='destructive' onClick={openDeleteModal}>
              삭제
            </Header.Button>
            <Header.Button Icon={Save} color='main' onClick={onSubmit}>
              {isUpdating ? '저장 중...' : '저장'}
            </Header.Button>
          </div>
        </Header>

        <form
          className='mx-auto max-w-4xl space-y-6 px-8 pb-12'
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}>
          <section className='space-y-3 rounded-2xl border border-gray-200 bg-white p-6'>
            <p className='block text-sm font-semibold text-gray-700'>Action Node</p>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='bg-main/10 text-main inline-block rounded-md px-2.5 py-1 text-sm font-semibold'>
                {card.actionNode.name}
              </span>
              {actionNodeDetail?.nodeType?.label && (
                <span className='inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'>
                  {actionNodeDetail.nodeType.label}
                </span>
              )}
            </div>

            {(() => {
              const payload = actionNodeDetail?.payload as
                | { example?: unknown; pointingExample?: unknown }
                | undefined;
              const example = typeof payload?.example === 'string' ? payload.example : '';
              const pointingExample =
                typeof payload?.pointingExample === 'string' ? payload.pointingExample : '';
              const description =
                typeof actionNodeDetail?.description === 'string'
                  ? actionNodeDetail.description
                  : '';

              const hasAny = description || example || pointingExample;
              if (!hasAny) return null;

              return (
                <dl className='space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 p-4 text-xs'>
                  {description && (
                    <div className='flex gap-3'>
                      <dt className='shrink-0 font-bold tracking-wide text-gray-500 uppercase'>
                        설명
                      </dt>
                      <dd className='min-w-0 flex-1 text-gray-700'>
                        <InlineProblemViewer maxLine={2}>{description}</InlineProblemViewer>
                      </dd>
                    </div>
                  )}
                  {example && (
                    <div className='flex gap-3'>
                      <dt className='shrink-0 font-bold tracking-wide text-gray-500 uppercase'>
                        예시
                      </dt>
                      <dd className='min-w-0 flex-1 text-gray-700'>
                        <InlineProblemViewer maxLine={2}>{example}</InlineProblemViewer>
                      </dd>
                    </div>
                  )}
                  {pointingExample && (
                    <div className='flex gap-3'>
                      <dt className='shrink-0 font-bold tracking-wide text-gray-500 uppercase'>
                        포인팅
                      </dt>
                      <dd className='min-w-0 flex-1 text-gray-700'>
                        <InlineProblemViewer maxLine={2}>{pointingExample}</InlineProblemViewer>
                      </dd>
                    </div>
                  )}
                </dl>
              );
            })()}

            <p className='text-xs text-gray-400'>Action Node는 생성 후 변경할 수 없습니다.</p>
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
            <Button type='submit' variant='primary' sizeType='md' disabled={isUpdating}>
              {isUpdating ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text={`'${card.actionNode.name}' 카드를 삭제하시겠어요?`}
          leftButtonText='취소'
          rightButtonText='삭제'
          variant='danger'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleConfirmDelete}
        />
      </Modal>
    </>
  );
}
