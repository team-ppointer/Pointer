'use client';

import { useRef } from 'react';

import { MyChat } from '@/components/qna/chat';
import putQna from '@/apis/controller/qna/putQna';
import { Edit } from '@/app/qna/page';
import putChat from '@/apis/controller/qna/putChat';

type QnaEditModalProps = {
  edit: Edit;
  onClose: () => void;
};

const QnaEditModal = ({ edit, onClose }: QnaEditModalProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const handleSubmit = async () => {
    if (edit.editMode === 'chat') {
      const result = await putChat(edit.editId ?? -1, messageRef.current?.innerText ?? '');
      if (result) {
        onClose();
      }
    } else {
      const result = await putQna(edit.editId ?? -1, messageRef.current?.innerText ?? '');
      if (result) {
        onClose();
      }
    }
  };

  return (
    <div className='flex w-full flex-col items-center justify-start gap-[0.8rem] px-[2rem] pb-[2.4rem]'>
      <p className='font-medium-16 mb-[0.8rem] w-full text-right text-white'>메시지 수정중</p>
      <MyChat>
        <div className='flex w-full flex-col justify-start gap-[0.8rem]'>
          <p className='font-medium-14 text-sub1 w-full text-left'>질문 내용</p>
          <p onClick={handleSubmit}> 수정</p>
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
    </div>
  );
};

export default QnaEditModal;
