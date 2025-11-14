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
  Bell,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  FileText,
  Clock,
  User,
  AlertCircle,
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
  const [isCreating, setIsCreating] = useState(false);

  const { data: noticeData } = getNotice(
    selectedStudent ? { studentId: selectedStudent.id } : { studentId: 0 }
  );
  const { mutate: mutateDeleteNotice } = deleteNotice();
  const { mutate: createNotice } = postNotice();
  const { invalidateAll } = useInvalidate();
  const { isOpen, openModal, closeModal } = useModal();

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
          closeModal();
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
          setIsCreating(false);
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
          {selectedStudent && !isCreating && (
            <Header.Button Icon={Plus} color='main' onClick={() => setIsCreating(true)}>
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
        ) : isCreating ? (
          /* Create Notice Form */
          <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
            <div className='border-b border-gray-100 bg-green-50 px-6 pt-6'>
              <h2 className='flex items-center gap-3 pb-6 text-xl font-bold text-gray-900'>
                <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                  <Bell className='h-5 w-5 text-white' />
                </div>
                공지 작성
              </h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
              <div className='space-y-6'>
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
                      <p className='mt-2 text-sm font-medium text-red-500'>
                        {errors.endAt.message}
                      </p>
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
                    <p className='mt-2 text-sm font-medium text-red-500'>
                      {errors.content.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='mt-6 flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    setIsCreating(false);
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
        ) : (
          /* Notice List */
          <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
            {notices.length === 0 ? (
              <div className='flex min-h-[400px] items-center justify-center p-8'>
                <div className='text-center'>
                  <Bell className='mx-auto mb-4 h-16 w-16 text-gray-300' />
                  <div className='mb-2 text-xl font-bold text-gray-400'>등록된 공지가 없습니다</div>
                  <div className='text-sm text-gray-400'>새 공지를 작성해보세요</div>
                </div>
              </div>
            ) : (
              <div className='grid h-[70rem] grid-cols-2'>
                {/* Notice List */}
                <div className='border-r border-gray-200 p-6'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                      <Bell className='h-5 w-5 text-white' />
                    </div>
                    <h3 className='text-lg font-bold text-gray-900'>공지 목록</h3>
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
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0 flex-1'>
                            <div className='mb-2 flex items-center gap-2'>
                              <Clock className='h-3.5 w-3.5 text-gray-400' />
                              <span className='text-xs font-medium text-gray-500'>
                                {dayjs(notice.startAt).format('YY.MM.DD')} ~{' '}
                                {dayjs(notice.endAt).format('YY.MM.DD')}
                              </span>
                            </div>
                            <p className='line-clamp-2 text-sm font-medium text-gray-900'>
                              {notice.content}
                            </p>
                          </div>
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNoticeToDelete(notice);
                              openModal();
                            }}
                            className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:border-red-300 hover:bg-red-100'>
                            <Trash2 className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notice Detail */}
                <div className='p-6'>
                  {selectedNotice ? (
                    <div>
                      <div className='mb-6 flex items-center gap-3'>
                        <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                          <FileText className='h-5 w-5 text-white' />
                        </div>
                        <h3 className='text-lg font-bold text-gray-900'>공지 상세</h3>
                      </div>

                      <div className='space-y-6'>
                        <div className='rounded-xl bg-gray-50 p-4'>
                          <div className='mb-2 flex items-center gap-2'>
                            <CalendarIcon className='h-4 w-4 text-gray-500' />
                            <span className='text-sm font-semibold text-gray-700'>공지 기간</span>
                          </div>
                          <p className='text-sm font-medium text-gray-900'>
                            {dayjs(selectedNotice.startAt).format('YYYY년 M월 D일')} ~{' '}
                            {dayjs(selectedNotice.endAt).format('YYYY년 M월 D일')}
                          </p>
                        </div>

                        <div className='rounded-xl border border-gray-200 bg-white p-4'>
                          <div className='mb-3 flex items-center gap-2'>
                            <FileText className='h-4 w-4 text-gray-500' />
                            <span className='text-sm font-semibold text-gray-700'>공지 내용</span>
                          </div>
                          <p className='text-sm leading-relaxed whitespace-pre-wrap text-gray-700'>
                            {selectedNotice.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex h-full items-center justify-center'>
                      <div className='text-center'>
                        <FileText className='mx-auto mb-4 h-12 w-12 text-gray-300' />
                        <div className='text-sm font-medium text-gray-400'>
                          자세히 볼 공지를 좌측에서 선택해주세요
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

      <Modal isOpen={isOpen} onClose={closeModal}>
        <TwoButtonModalTemplate
          text='공지를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeModal}
          handleClickRightButton={() => handleDeleteNotice(selectedNoticeToDelete?.id ?? -1)}
        />
      </Modal>
    </div>
  );
}
