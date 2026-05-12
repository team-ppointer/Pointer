import { deleteFocusCard, getFocusCardList } from '@apis';
import { Header, Modal, TwoButtonModalTemplate } from '@components';
import { useInvalidate, useModal } from '@hooks';
import { InlineProblemViewer } from '@repo/pointer-editor-v2';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Slide, toast, ToastContainer } from 'react-toastify';

import '@repo/pointer-editor-v2/style.css';

export const Route = createFileRoute('/_GNBLayout/focus-card/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { invalidateFocusCardList } = useInvalidate();
  const { data: listResp, isLoading } = getFocusCardList();
  const { mutate: mutateDelete } = deleteFocusCard();

  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const handleClickDelete = (e: React.MouseEvent, id: number, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget({ id, name });
    openDeleteModal();
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    mutateDelete(
      { params: { path: { id: deleteTarget.id } } },
      {
        onSuccess: () => {
          invalidateFocusCardList();
          toast.success('카드가 삭제되었습니다');
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
    closeDeleteModal();
    setDeleteTarget(null);
  };

  const cards = listResp?.data ?? [];

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
        <Header title='집중학습 카드'>
          <Header.Button
            Icon={Plus}
            color='main'
            onClick={() => navigate({ to: '/focus-card/register' })}>
            신규 생성
          </Header.Button>
        </Header>

        <div className='mx-auto max-w-7xl px-8 pb-12'>
          {isLoading ? (
            <div className='flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white'>
              <p className='text-sm text-gray-400'>불러오는 중...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className='flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white'>
              <Sparkles className='h-8 w-8 text-gray-300' />
              <p className='text-base font-semibold text-gray-700'>아직 등록된 카드가 없습니다</p>
              <p className='text-sm text-gray-400'>
                우측 상단 '신규 생성' 버튼으로 첫 카드를 만들어 보세요.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {cards.map((card) => (
                <Link
                  key={card.id}
                  to='/focus-card/$focusCardId'
                  params={{ focusCardId: String(card.id) }}
                  className='group hover:border-main flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/40'>
                  <div className='flex items-start justify-between gap-2'>
                    <span className='bg-main/10 text-main inline-block rounded-md px-2 py-0.5 text-xs font-semibold'>
                      {card.actionNode.name}
                    </span>
                    <button
                      type='button'
                      onClick={(e) => handleClickDelete(e, card.id, card.actionNode.name)}
                      className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600'>
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-gray-400'>제목</p>
                    <InlineProblemViewer maxLine={1}>{card.title}</InlineProblemViewer>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-gray-400'>설명</p>
                    <InlineProblemViewer maxLine={2}>{card.description}</InlineProblemViewer>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text={`'${deleteTarget?.name ?? ''}' 카드를 삭제하시겠어요?`}
          leftButtonText='취소'
          rightButtonText='삭제'
          variant='danger'
          handleClickLeftButton={() => {
            closeDeleteModal();
            setDeleteTarget(null);
          }}
          handleClickRightButton={handleConfirmDelete}
        />
      </Modal>
    </>
  );
}
