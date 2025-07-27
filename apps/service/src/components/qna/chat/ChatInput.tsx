import { useRef, useState } from 'react';

import { IcButton } from '@components';
import { IcArrowUp, IcCamera } from '@svg';
import postChat from '@/apis/controller/qna/postChat';
import { getFileUploadUrl, uploadFileToS3 } from '@/apis/controller/file/fileUpload';

type ChatInputProps = {
  qnaId: number;
  refetch: () => void;
  scrollToBottom: () => void;
};

const ChatInput = ({ qnaId, refetch, scrollToBottom }: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [chatValue, setChatValue] = useState('');

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';

      const lineHeight = 24; // 1.5rem = 24px
      const maxLines = 4;
      const maxHeight = lineHeight * maxLines;

      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;

      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'scroll';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatValue(e.target.value);
    adjustTextareaHeight();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    handleSubmit(fileArray);
    e.target.value = '';
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (images: File[]) => {
    if (images.length > 0) {
      try {
        const uploadUrls = await getFileUploadUrl(images.map((image) => image.name));
        const success = await uploadFileToS3(
          images,
          uploadUrls.map((url) => ({
            ...url,
            fileName: url.fileName.fileName,
          }))
        );
        if (success) {
          const result = await postChat(
            qnaId,
            '',
            uploadUrls.map((url) => url.id)
          );
          if (result) {
            refetch();
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error uploading images:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (chatValue.trim() === '') return;

    const result = await postChat(qnaId, chatValue);
    if (result) {
      setChatValue('');
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = '24px'; // 1줄 높이로 초기화
        textareaRef.current.style.overflowY = 'hidden';
        textareaRef.current.focus();
      }
      refetch();
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };
  return (
    <div className='flex h-full w-full max-w-[768px] items-center justify-between bg-white px-[2rem] py-[1.2rem]'>
      <div className='bg-background flex h-full w-full items-end justify-between gap-[0.8rem] rounded-[1.6rem] py-[0.85rem] pr-[1.2rem] pl-[1.6rem]'>
        <textarea
          className='font-medium-16 placeholder:text-lightgray500 my-[0.5rem] h-full min-h-[2.4rem] w-full resize-none border-0 bg-transparent leading-[2.4rem] focus:outline-0'
          placeholder='내용을 입력해 주세요'
          ref={textareaRef}
          onChange={handleTextareaChange}
          rows={1}
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
