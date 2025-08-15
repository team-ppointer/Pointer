import { Button, IconButton, Modal, TwoButtonModalTemplate } from '@components';
import { deleteNotice, getNotice } from '@apis';
import { components } from '@schema';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useInvalidate, useModal } from '@hooks';
import { Slide, toast, ToastContainer } from 'react-toastify';

interface Props {
  selectedStudent: components['schemas']['StudentResp'] | null;
  onClose: () => void;
}

const NoticeListModal = ({ selectedStudent, onClose }: Props) => {
  const { data: noticeData } = getNotice(
    selectedStudent ? { studentId: selectedStudent.id } : { studentId: 0 }
  );
  const { mutate: mutateDeleteNotice } = deleteNotice();
  const { invalidateAll } = useInvalidate();
  const { isOpen, openModal, closeModal } = useModal();

  const notices = noticeData?.data ?? [];

  const [selectedNotice, setSelectedNotice] = useState<components['schemas']['NoticeResp'] | null>(
    null
  );

  const [selectedNoticeToDelete, setSelectedNoticeToDelete] = useState<
    components['schemas']['NoticeResp'] | null
  >(null);

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

  if (!selectedStudent) {
    return (
      <div className='w-[70dvw] p-800'>
        <h2 className='font-bold-24 mb-600 text-black'>공지 목록</h2>
        <p className='font-medium-16 text-lightgray500 mb-600'>
          공지를 확인하려면 먼저 학생을 선택해주세요.
        </p>
        <div className='flex justify-end'>
          <Button variant='light' onClick={onClose}>
            확인
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
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
      <div className='w-[80dvw] max-w-[120rem] p-800'>
        <h2 className='font-bold-24 mb-600 text-black'>공지 목록</h2>

        {/* 메인 콘텐츠 */}
        <div className='max-h-[70rem] overflow-hidden'>
          {notices.length === 0 ? (
            <div className='bg-lightgray100 rounded-200 flex h-[40rem] items-center justify-center'>
              <p className='font-medium-16 text-lightgray500 mb-200'>등록된 공지가 없습니다</p>
            </div>
          ) : (
            <div className='grid h-full grid-cols-2 gap-200'>
              <div className='bg-lightgray100 rounded-400 overflow-hidden p-800'>
                <div className='max-h-[50rem] overflow-y-auto'>
                  <div className='space-y-200'>
                    {notices.map((notice) => (
                      <div
                        key={notice.id}
                        className={`rounded-200 cursor-pointer border bg-white ${
                          selectedNotice?.id === notice.id
                            ? 'border-lightgray500'
                            : 'hover:border-lightgray300 border-transparent'
                        }`}
                        onClick={() => setSelectedNotice(notice)}>
                        <div className='p-400'>
                          <div className='flex items-center justify-between gap-400'>
                            <div className='min-w-0 flex-1'>
                              <div className='mb-200 flex items-center gap-200'>
                                <span className='font-medium-12 text-midgray100 rounded-300 bg-lightgray100 px-300 py-100'>
                                  {dayjs(notice.startAt).format('YY.MM.DD')} ~{' '}
                                  {dayjs(notice.endAt).format('YY.MM.DD')}
                                </span>
                              </div>
                              <p className='font-medium-16 line-clamp-2 pl-100 text-black'>
                                {notice.content}
                              </p>
                            </div>
                            <div className='flex-shrink-0'>
                              <IconButton
                                variant='delete'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNoticeToDelete(notice);
                                  openModal();
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* 공지 내용 */}
              <div className='rounded-400 bg-lightgray100 overflow-hidden p-800'>
                <div className='h-full max-h-[50rem] overflow-y-auto'>
                  {selectedNotice ? (
                    <div className='space-y-600'>
                      <div>
                        <div className='mb-200 flex items-center gap-400'>
                          <span className='font-medium-14 text-lightgray600'>공지 기간</span>
                        </div>
                        <p className='font-medium-16 mb-800 text-black'>
                          {dayjs(selectedNotice.startAt).format('YYYY년 M월 D일')} ~{' '}
                          {dayjs(selectedNotice.endAt).format('YYYY년 M월 D일')}
                        </p>
                        <div className='mb-200 flex items-center gap-400'>
                          <span className='font-medium-14 text-lightgray600'>공지 내용</span>
                        </div>
                        <p className='font-medium-16 whitespace-pre-wrap text-black'>
                          {selectedNotice.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='flex h-full min-h-[30rem]'>
                      <p className='font-medium-16 text-lightgray500 mb-200'>
                        자세히 볼 공지를 좌측에서 선택해주세요
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className='border-lightgray200 mt-800 flex justify-end border-t pt-600'>
          <Button variant='dark' onClick={onClose}>
            완료
          </Button>
        </div>
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
    </>
  );
};

export default NoticeListModal;
