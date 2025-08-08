'use client';

import { useRef } from 'react';

import { MyChat } from '@/components/qna/chat';
import { Edit } from '@/app/qna/page';
import { putChat, putQna, putTeacherChat } from '@apis';
import { showToast } from '@utils';

type QnaEditModalProps = {
  edit: Edit;
  onClose: () => void;
  user?: 'teacher' | 'student';
};

const QnaEditModal = ({ edit, onClose, user = 'student' }: QnaEditModalProps) => {
  const putMessage = user === 'teacher' ? putTeacherChat : putChat;
  const messageRef = useRef<HTMLDivElement>(null);
  const handleSubmit = async () => {
    if (edit.editMode === 'chat') {
      const result = await putMessage(edit.editId ?? -1, messageRef.current?.innerText ?? '');
      if (result) {
        onClose();
      } else {
        showToast.error('채팅 수정에 실패했습니다. 다시 시도해주세요.');
        onClose();
      }
    } else {
      const result = await putQna(
        edit.editId ?? -1,
        messageRef.current?.innerText ?? '',
        edit.images ?? []
      );
      if (result) {
        onClose();
      } else {
        showToast.error('질문 수정에 실패했습니다. 다시 시도해주세요.');
        onClose();
      }
    }
  };

  return (
    <div className='flex w-full flex-col items-end justify-start gap-[0.8rem] px-[2rem] pb-[2.4rem]'>
      <MyChat>
        <div className='flex w-full flex-col justify-start gap-[0.8rem]'>
          <p className='font-medium-14 text-sub1 w-full text-left'>질문 내용</p>
          <div
            className='min-w-0 resize-none text-[1.6rem] whitespace-pre-wrap text-white focus:outline-0'
            contentEditable
            suppressContentEditableWarning
            ref={messageRef}
            autoFocus>
            {edit.editContent}
          </div>
        </div>
      </MyChat>
      <button
        className='font-medium-12 text-main rounded-[0.8rem] bg-white px-[1.2rem] py-[0.6rem]'
        onClick={handleSubmit}>
        수정 완료
      </button>
    </div>
  );
};

export default QnaEditModal;
