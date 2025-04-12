import { Button } from '@components';
import { ButtonHTMLAttributes } from 'react';

interface ModalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'dark' | 'light' | 'dimmed';
  children: React.ReactNode;
}

const BaseModalTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <article className='font-medium-18 flex max-w-[50dvw] min-w-[38.4rem] flex-col items-center justify-center gap-[3.2rem] px-[6.4rem] py-[4.8rem]'>
      {children}
    </article>
  );
};

const ModalContent = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex flex-col items-center justify-between gap-[1.6rem]'>{children}</div>;
};

const ModalText = ({ text }: { text: string }) => {
  return <p>{text}</p>;
};

const ModalButtonSection = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex w-full items-center justify-center gap-[1.6rem]'>{children}</div>;
};

const ModalButton = ({ variant = 'dark', children, onClick, ...props }: ModalButtonProps) => {
  return (
    <Button
      className='w-fit min-w-[12rem] px-[2.4rem]'
      variant={variant}
      onClick={onClick}
      {...props}>
      {children}
    </Button>
  );
};

BaseModalTemplate.Content = ModalContent;
BaseModalTemplate.Text = ModalText;
BaseModalTemplate.ButtonSection = ModalButtonSection;
BaseModalTemplate.Button = ModalButton;

export default BaseModalTemplate;
