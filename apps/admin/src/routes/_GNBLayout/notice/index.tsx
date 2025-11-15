import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { deleteNotice, getNotice, postNotice } from '@apis';
import { useInvalidate, useModal, useSelectedStudent } from '@hooks';
import { Header, Modal, TwoButtonModalTemplate } from '@components';
import { components } from '@schema';
import dayjs from 'dayjs';
import { Slide, toast, ToastContainer } from 'react-toastify';
import {
  Plus,
  Trash2,
  FileText,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Megaphone,
} from 'lucide-react';

export const Route = createFileRoute('/_GNBLayout/notice/')({
  component: RouteComponent,
});

interface FormData {
  startAt: string;
  endAt: string;
  content: string;
}

function RouteComponent() {
  const { selectedStudent } = useSelectedStudent();
  const [selectedNotice, setSelectedNotice] = useState<components['schemas']['NoticeResp'] | null>(
    null
  );
  const [selectedNoticeToDelete, setSelectedNoticeToDelete] = useState<
    components['schemas']['NoticeResp'] | null
  >(null);

  const { data: noticeData } = getNotice(
    selectedStudent ? { studentId: selectedStudent.id } : { studentId: 0 }
  );
  const { mutate: mutateDeleteNotice } = deleteNotice();
  const { mutate: createNotice } = postNotice();
  const { invalidateAll } = useInvalidate();

  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const {
    isOpen: isCreateModalOpen,
    openModal: openCreateModal,
    closeModal: closeCreateModal,
  } = useModal();

  const notices = noticeData?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const handleDeleteNotice = (noticeId: number) => {
    mutateDeleteNotice(
      {
        params: {
          path: {
            id: noticeId,
          },
        },
      },
      {
        onSuccess: () => {
          if (selectedNoticeToDelete?.id === selectedNotice?.id) {
            setSelectedNotice(null);
          }
          setSelectedNoticeToDelete(null);
          invalidateAll();
          closeDeleteModal();
          toast.success('공지가 삭제되었습니다.');
        },
        onError: (error: unknown) => {
          toast.error((error as { message?: string })?.message || '공지 삭제에 실패했습니다.');
        },
      }
    );
  };

  const onSubmit = (data: FormData) => {
    if (!selectedStudent) return;

    createNotice(
      {
        body: {
          startAt: data.startAt,
          endAt: data.endAt,
          content: data.content,
          studentId: selectedStudent.id,
        },
      },
      {
        onSuccess: () => {
          invalidateAll();
          closeCreateModal();
          reset();
          toast.success('공지가 작성되었습니다.');
        },
        onError: (error: unknown) => {
          toast.error((error as { message?: string })?.message || '공지 작성에 실패했습니다.');
        },
      }
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <ToastContainer
        position='top-center'
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme='dark'
        transition={Slide}
        style={{
          fontSize: '1.6rem',
        }}
      />

      {/* Header */}
      <Header title='공지'>
        <div className='flex items-center gap-3'>
          {selectedStudent && (
            <Header.Button Icon={Plus} color='main' onClick={openCreateModal}>
              공지 작성
            </Header.Button>
          )}
        </div>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        {!selectedStudent ? (
          <div className='mb-6 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6'>
            <AlertCircle className='mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600' />
            <div>
              <h3 className='mb-1 text-lg font-bold text-amber-900'>학생을 선택해주세요</h3>
              <p className='text-sm text-amber-700'>
                사이드바에서 학생을 선택하시면 해당 학생의 공지를 관리할 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          /* Notice List */
          <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
            {notices.length === 0 ? (
              <div className='flex min-h-[400px] items-center justify-center p-8'>
                <div className='text-center'>
                  <Megaphone className='mx-auto mb-4 h-12 w-12 text-gray-300' />
                  <div className='mb-2 text-sm font-medium text-gray-400'>
                    등록된 공지가 없습니다
                  </div>
                  <div className='text-sm text-gray-400'>새 공지를 작성해보세요</div>
                </div>
              </div>
            ) : (
              <div className='grid h-[calc(100dvh-12rem)] grid-cols-2'>
                {/* Notice List */}
                <div className='border-r border-gray-200 p-6'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                      <Megaphone className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-gray-900'>공지 목록</h3>
                      <p className='text-sm text-gray-500'>{notices.length || 0}개</p>
                    </div>
                  </div>
                  <div className='max-h-[60rem] space-y-3 overflow-y-auto'>
                    {notices.map((notice) => (
                      <div
                        key={notice.id}
                        onClick={() => setSelectedNotice(notice)}
                        className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                          selectedNotice?.id === notice.id
                            ? 'bg-main/10 border-main/40'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                        <p className='mb-2 line-clamp-2 text-sm font-medium text-gray-900'>
                          {notice.content}
                        </p>
                        <div className='flex items-center gap-2 text-xs text-gray-500'>
                          <Clock className='h-3.5 w-3.5' />
                          <span className=''>
                            {dayjs(notice.startAt).format('YYYY년 M월 D일')} ~{' '}
                            {dayjs(notice.endAt).format('YYYY년 M월 D일')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notice Detail */}
                <div className='p-6'>
                  {selectedNotice ? (
                    <div className='flex h-full flex-col'>
                      <div className='mb-6 flex items-center justify-between'>
                        <div className='flex flex-col gap-0.5'>
                          <h3 className='text-lg font-bold text-gray-900'>공지 상세</h3>
                          <div className='flex items-center gap-2 text-sm text-gray-500'>
                            <Clock className='h-3.5 w-3.5' />
                            {dayjs(selectedNotice.startAt).format('YYYY년 M월 D일')} ~{' '}
                            {dayjs(selectedNotice.endAt).format('YYYY년 M월 D일')}
                          </div>
                        </div>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedNoticeToDelete(selectedNotice);
                            openDeleteModal();
                          }}
                          className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100'>
                          <Trash2 className='h-4 w-4' />
                          삭제
                        </button>
                      </div>

                      <div className='flex-1'>
                        <div className='h-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-6'>
                          <div className='text-sm leading-relaxed whitespace-pre-wrap text-gray-700'>
                            {selectedNotice.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex h-full items-center justify-center'>
                      <div className='text-center'>
                        <FileText className='mx-auto mb-4 h-12 w-12 text-gray-300' />
                        <div className='mb-2 text-sm font-medium text-gray-400'>
                          공지를 선택해주세요
                        </div>
                        <div className='text-sm text-gray-400'>
                          왼쪽 목록에서 공지를 클릭하면 상세 내용을 확인할 수 있습니다
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='공지를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={() => handleDeleteNotice(selectedNoticeToDelete?.id ?? -1)}
        />
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal}>
        <div className='w-[60rem] rounded-2xl bg-white p-8'>
          <div className='mb-6 flex items-center gap-3'>
            <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
              <Megaphone className='h-5 w-5 text-white' />
            </div>
            <h3 className='text-xl font-bold text-gray-900'>새 공지 작성</h3>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-6 space-y-6'>
              {/* Date Inputs */}
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>
                    <div className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4 text-gray-500' />
                      공지 시작일
                    </div>
                  </label>
                  <input
                    type='date'
                    {...register('startAt', {
                      required: '공지 시작일을 선택해주세요.',
                    })}
                    className='focus:border-main focus:ring-main/20 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 hover:border-gray-300 focus:bg-white focus:ring-2 focus:outline-none'
                  />
                  {errors.startAt && (
                    <p className='mt-2 text-sm font-medium text-red-500'>
                      {errors.startAt.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>
                    <div className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4 text-gray-500' />
                      공지 종료일
                    </div>
                  </label>
                  <input
                    type='date'
                    {...register('endAt', {
                      required: '공지 종료일을 선택해주세요.',
                    })}
                    className='focus:border-main focus:ring-main/20 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 hover:border-gray-300 focus:bg-white focus:ring-2 focus:outline-none'
                  />
                  {errors.endAt && (
                    <p className='mt-2 text-sm font-medium text-red-500'>{errors.endAt.message}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-gray-500' />
                    공지 내용
                  </div>
                </label>
                <textarea
                  {...register('content', {
                    required: '공지 내용을 입력해주세요.',
                  })}
                  placeholder='여기에 공지를 작성해주세요.'
                  rows={10}
                  className='focus:border-main focus:ring-main/20 w-full resize-none rounded-xl border border-gray-200 p-4 text-sm transition-all duration-200 hover:border-gray-300 focus:bg-white focus:ring-2 focus:outline-none'
                />
                {errors.content && (
                  <p className='mt-2 text-sm font-medium text-red-500'>{errors.content.message}</p>
                )}
              </div>
            </div>

            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => {
                  closeCreateModal();
                  reset();
                }}
                className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                취소
              </button>
              <button
                type='submit'
                className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200'>
                완료
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
