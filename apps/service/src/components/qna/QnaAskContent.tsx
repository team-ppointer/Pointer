'use client';

import { useRef, useState } from 'react';

import { IcButton } from '@components';
import { IcCamera, IcPhoto } from '@svg';
import { QnaAskImageBox, QnaAskTextArea } from '@/components/qna';

type QnaAskContentProps = {
  handleTextareaOnChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const QnaAskContent = ({ handleTextareaOnChange }: QnaAskContentProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleImageDelete = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className='flex w-full flex-1 flex-col items-start justify-start gap-[1.6rem] rounded-[1.6rem] bg-white p-[2rem]'>
      <div className='text-main flex w-full items-center justify-between'>
        <p className='font-bold-16'>내용</p>
        <IcButton onClick={openPicker}>
          <IcCamera width={24} height={24} />
        </IcButton>
      </div>
      <div className='bg-background flex w-full flex-1 flex-col items-start justify-between gap-[1.6rem] rounded-[0.8rem] py-[1.6rem]'>
        <QnaAskTextArea handleTextareaOnChange={handleTextareaOnChange} />
        <div className='flex h-fit w-full shrink-0 items-center justify-start gap-[0.8rem] overflow-hidden overflow-x-auto px-[1.6rem] py-[0.4rem]'>
          {previewUrls.map((url, index) => (
            <QnaAskImageBox key={index} imageUrl={url} onDelete={() => handleImageDelete(index)} />
          ))}
        </div>
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

export default QnaAskContent;
