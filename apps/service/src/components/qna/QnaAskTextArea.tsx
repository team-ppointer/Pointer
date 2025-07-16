import { ForwardedRef, useRef } from 'react';

type QnaAskTextAreaProps = {
  handleTextareaOnChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const QnaAskTextArea = ({ handleTextareaOnChange }: QnaAskTextAreaProps) => {
  const textareaRef: ForwardedRef<HTMLTextAreaElement> = useRef<HTMLTextAreaElement>(null);
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    let el: HTMLTextAreaElement | null = null;
    if (textareaRef && typeof textareaRef !== 'function') {
      el = textareaRef.current;
    } else {
      el = e.currentTarget;
    }
    if (el) {
      el.style.height = 'auto'; // 높이 초기화
      el.style.height = `${el.scrollHeight}px`; // 내용에 맞게 높이 설정
    }
  };

  return (
    <textarea
      className='font-medium-16 placeholder:text-lightgray500 h-fit min-h-[0.9rem] w-full resize-none px-[1.6rem] outline-none focus:outline-none'
      placeholder='내용'
      ref={textareaRef}
      onInput={handleInput}
      onChange={handleTextareaOnChange}
    />
  );
};

export default QnaAskTextArea;
