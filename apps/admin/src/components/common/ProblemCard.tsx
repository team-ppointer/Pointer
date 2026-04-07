import { ProblemViewer } from '@repo/pointer-editor-v2';
import { Trash2, MessageSquare } from 'lucide-react';

interface ProblemCardProps {
  customId: string;
  title: string;
  memo?: string;
  problemText: string;
  answer: string;
  onDelete: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: () => void;
}

const ProblemCard = ({
  customId,
  title,
  memo,
  problemText,
  answer: _answer,
  onDelete,
  onClick,
}: ProblemCardProps) => {
  return (
    <div
      className='group relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl/5'
      onClick={onClick}>
      {/* Delete Button */}
      <button
        type='button'
        onClick={onDelete}
        className='absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:border-red-200 hover:bg-red-100'>
        <Trash2 className='h-4 w-4' />
      </button>

      <div className='p-6'>
        {/* Header */}
        <div className='mb-4 flex items-start gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='mb-1 flex items-center gap-2'>
              <span className='bg-main/10 text-main inline-flex rounded-lg px-2 py-1 font-mono text-xs font-semibold'>
                {customId || '-'}
              </span>
            </div>
            <h3 className='ml-1 line-clamp-2 text-base font-bold text-gray-900'>{title}</h3>
          </div>
        </div>

        {/* Problem Text */}
        <div className='relative w-full'>
          <ProblemViewer content={JSON.parse(problemText)} padding={4} />
        </div>
        {/* Memo */}
        {memo && (
          <div className='mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-3'>
            <div className='mb-1 flex items-center gap-2'>
              <MessageSquare className='h-3.5 w-3.5 text-amber-600' />
              <span className='text-xs font-semibold text-amber-700'>메모</span>
            </div>
            <p className='line-clamp-2 text-sm text-amber-900/80'>{memo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Legacy compound component structure (keeping for backward compatibility if needed)
const CardTextSection = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex flex-col gap-4'>{children}</div>;
};

const CardTitle = ({ customId, title }: { customId: string; title: string }) => {
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-xs font-semibold text-gray-500'>문제 타이틀</span>
      <div className='flex gap-2'>
        <span className='inline-flex rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 px-2.5 py-1 text-xs font-bold text-blue-700'>
          {customId}
        </span>
        <span className='flex-1 truncate text-sm font-semibold text-gray-900'>{title}</span>
      </div>
    </div>
  );
};

const CardButtonSection = ({ children }: { children: React.ReactNode }) => {
  return <div className='absolute top-4 right-4 flex'>{children}</div>;
};

const CardInfo = ({ label, content }: { label: string; content?: string }) => {
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-xs font-semibold text-gray-500'>{label}</span>
      <span
        className={`text-sm text-gray-700 ${label === '문제' ? 'line-clamp-2' : 'line-clamp-1'}`}>
        {content}
      </span>
    </div>
  );
};

const CardImage = ({ src, height }: { src?: string; height: string }) => {
  return (
    <img
      src={src ? src : '/images/image-placeholder.svg'}
      alt='problem-thumbnail'
      className='w-full rounded-xl object-contain'
      style={{ height }}
    />
  );
};

const CardTagSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex gap-4'>
      <span className='min-w-[6.7rem] text-base font-semibold text-gray-500'>개념 태그</span>
      <div className='flex flex-wrap gap-2'>{children}</div>
    </div>
  );
};

const CardEmptyView = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      className='flex h-full w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-all duration-200 hover:border-[var(--color-main)] hover:bg-[var(--color-main)]/5'
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}>
      <span className='text-center text-xl font-bold whitespace-pre-line text-gray-400'>{`여기를 클릭해\n문제를 추가해주세요.`}</span>
    </div>
  );
};

ProblemCard.TextSection = CardTextSection;
ProblemCard.Title = CardTitle;
ProblemCard.ButtonSection = CardButtonSection;
ProblemCard.Info = CardInfo;
ProblemCard.CardImage = CardImage;
ProblemCard.TagSection = CardTagSection;
ProblemCard.EmptyView = CardEmptyView;

export default ProblemCard;
