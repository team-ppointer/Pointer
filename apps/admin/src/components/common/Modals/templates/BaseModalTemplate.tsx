import { Button } from '@components';
import { ButtonHTMLAttributes } from 'react';

interface ModalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'dark' | 'light' | 'dimmed';
  children: React.ReactNode;
}

const BaseModalTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <article className='flex max-w-[500px] min-w-[400px] flex-col items-center justify-center gap-6 px-8 py-6'>
      {children}
    </article>
  );
};

const ModalContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col items-center justify-between gap-4 text-center'>{children}</div>
  );
};

const ModalText = ({ text }: { text: string }) => {
  return <p className='text-base font-medium text-gray-700'>{text}</p>;
};

const ModalButtonSection = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex w-full items-center justify-center gap-3'>{children}</div>;
};

const ModalButton = ({ variant = 'dark', children, onClick, ...props }: ModalButtonProps) => {
  return (
    <Button className='min-w-[120px] px-6' variant={variant} onClick={onClick} {...props}>
      {children}
    </Button>
  );
};

BaseModalTemplate.Content = ModalContent;
BaseModalTemplate.Text = ModalText;
BaseModalTemplate.ButtonSection = ModalButtonSection;
BaseModalTemplate.Button = ModalButton;

export default BaseModalTemplate;
