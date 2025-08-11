import { Button, IconButton } from '@components';
import { getNotice } from '@apis';
import { components } from '@schema';
import { IcDeleteSm } from '@svg';
import dayjs from 'dayjs';
import { useState } from 'react';

interface Props {
  selectedStudent: components['schemas']['StudentResp'] | null;
  onClose: () => void;
}

const NoticeListModal = ({ selectedStudent, onClose }: Props) => {
  const { data: noticeData } = getNotice(
    selectedStudent ? { studentId: selectedStudent.id } : { studentId: 0 }
  );

  const notices = noticeData?.data ?? [];

  const [selectedNotice, setSelectedNotice] = useState<components['schemas']['NoticeResp'] | null>(
    null
  );

  const handleDeleteNotice = (noticeId: number) => {
    alert(`(${noticeId}) 공지 삭제 API가 없어용`);
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
    <div className='w-[70dvw] p-800'>
      <h2 className='font-bold-24 mb-600 text-black'>공지 목록</h2>

      <div className='max-h-[50rem] overflow-y-auto'>
        {notices.length === 0 ? (
          <div className='bg-lightgray100 rounded-200 flex h-[20rem] items-center justify-center'>
            <p className='font-medium-16 text-lightgray500'>등록된 공지가 없습니다.</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-200'>
            <div className='bg-lightgray100 rounded-400 space-y-300 p-800'>
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`rounded-200 flex cursor-pointer items-center gap-400 bg-white px-400 py-200 ${
                    selectedNotice?.id === notice.id
                      ? 'border-lightgray500 border'
                      : 'border border-transparent'
                  }`}
                  onClick={() => setSelectedNotice(notice)}>
                  <span className='font-medium-16 text-lightgray500'>
                    {dayjs(notice.startAt).format('YYYYMMDD')}~
                    {dayjs(notice.endAt).format('YYYYMMDD')}
                  </span>
                  <span className='font-medium-16 flex-1 truncate'>{notice.content}</span>
                  <IconButton variant='delete' onClick={() => handleDeleteNotice(notice.id)} />
                </div>
              ))}
            </div>
            <div className='bg-lightgray100 rounded-400 p-800'>
              {selectedNotice ? (
                <div className='font-medium-16 text-black'>{selectedNotice.content}</div>
              ) : (
                <div className='font-medium-16 text-lightgray500'>
                  자세히 볼 공지를 좌측에서 선택해주세요
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className='mt-600 flex justify-end pt-600'>
        <Button variant='dark' onClick={onClose}>
          완료
        </Button>
      </div>
    </div>
  );
};

export default NoticeListModal;
