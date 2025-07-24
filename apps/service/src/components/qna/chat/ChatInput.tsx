import { useRef, useState } from 'react';

import { IcButton } from '@components';
import { IcArrowUp, IcCamera } from '@svg';
import postChat from '@/apis/controller/qna/postChat';

type ChatInputProps = {
  qnaId: number;
  refetch: () => void;
  scrollToBottom: () => void;
};

const ChatInput = ({ qnaId, refetch, scrollToBottom }: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [chatValue, setChatValue] = useState('');
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleSendMessage = async () => {
    if (chatValue.trim() === '') return;
    const result = await postChat(qnaId, chatValue);
    if (result) {
      setChatValue('');
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.focus();
      }
      refetch();
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };
  return (
    <div className='flex w-full max-w-[768px] items-center justify-between bg-white px-[2rem] py-[1.2rem]'>
      <div className='bg-background flex h-[5rem] w-full items-center justify-between gap-[0.8rem] rounded-[1.6rem] pr-[1.2rem] pl-[1.6rem]'>
        <textarea
          className='font-medium-16 placeholder:text-lightgray500 h-[2.4rem] w-full overflow-hidden border-0 bg-transparent focus:outline-0'
          placeholder='내용을 입력해 주세요'
          ref={textareaRef}
          onChange={(e) => setChatValue(e.target.value)}
        />
        {!chatValue ? (
          <IcButton onClick={openPicker}>
            <IcCamera width={24} height={24} />
          </IcButton>
        ) : (
          <IcButton variant='secondary' onClick={handleSendMessage}>
            <IcArrowUp width={24} height={24} />
          </IcButton>
        )}
        <input
          type='file'
          accept='image/*'
          multiple
          ref={inputRef}
          onChange={handleImageChange}
          className='hidden'
        />
      </div>
    </div>
  );
};
export default ChatInput;
