import { IcNextGray } from '@svg';

interface BottomSheetButtonProps {
  variant?: 'default' | 'recommend';
  label: string;
  onClick?: () => void;
}

const BaseBottomSheetTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <article className='font-medium-16 flex flex-col items-center justify-center gap-[2rem]'>
      {children}
    </article>
  );
};

const BottomSheetContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col items-center justify-between gap-[2rem] text-center'>
      {children}
    </div>
  );
};

const BottomSheetText = ({ text }: { text: string }) => {
  return <p>{text}</p>;
};

const BottomSheetButtonSection = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex w-full flex-col'>{children}</div>;
};

const BottomSheetButton = ({ variant = 'default', label, onClick }: BottomSheetButtonProps) => {
  return (
    <div
      className='flex h-[5rem] w-full cursor-pointer items-center justify-between'
      onClick={onClick}>
      <div className='flex items-center justify-between gap-[1.6rem]'>
        <p className={variant === 'recommend' ? 'text-main' : ''}>{label}</p>
        {variant === 'recommend' && (
          <div className='bg-sub2 text-main font-medium-14 flex h-[2.4rem] items-center justify-center rounded-[0.8rem] px-[1rem]'>
            추천
          </div>
        )}
      </div>
      <IcNextGray width={24} height={24} />
    </div>
  );
};

BaseBottomSheetTemplate.Content = BottomSheetContent;
BaseBottomSheetTemplate.Text = BottomSheetText;
BaseBottomSheetTemplate.ButtonSection = BottomSheetButtonSection;
BaseBottomSheetTemplate.Button = BottomSheetButton;

export default BaseBottomSheetTemplate;
