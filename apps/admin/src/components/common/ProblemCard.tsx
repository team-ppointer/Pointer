import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

interface ProblemCardProps {
  children: React.ReactNode;
  problemId?: number;
}

const ProblemCard = ({ children, problemId }: ProblemCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: problemId ?? 0,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };

  return (
    <section
      className='relative flex min-h-[67rem] w-full min-w-[48rem] cursor-pointer flex-col gap-[3.2rem] rounded-[16px] bg-white p-[3.2rem]'
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}>
      {children}
    </section>
  );
};

const CardTextSection = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex flex-col gap-[1.6rem]'>{children}</div>;
};

const CardTitle = ({ title }: { title: string }) => {
  return <h3 className='font-bold-24 flex items-center gap-[1.6rem]'>{title}</h3>;
};

const CardButtonSection = ({ children }: { children: React.ReactNode }) => {
  return <div className='absolute top-[3.2rem] right-[3.2rem] flex gap-[1.6rem]'>{children}</div>;
};

const CardInfo = ({ label, content }: { label: string; content?: string }) => {
  return (
    <div className='flex gap-[1.6rem]'>
      <span className='font-medium-18 text-midgray200 min-w-[6.7rem]'>{label}</span>
      <span className='font-medium-18 flex-1 truncate text-black'>{content}</span>
    </div>
  );
};

const CardImage = ({ src, height }: { src?: string; height: string }) => {
  return (
    <img
      src={src ? src : '/images/image-placeholder.svg'}
      alt='problem-thumbnail'
      className='w-full object-contain'
      style={{ height }}
    />
  );
};

const CardTagSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex gap-[1.6rem]'>
      <span className='font-medium-18 text-midgray200 min-w-[6.7rem]'>개념 태그</span>
      <div className='flex flex-wrap gap-[0.8rem]'>{children}</div>
    </div>
  );
};

const CardEmptyView = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      className='flex h-full w-full cursor-pointer items-center justify-center'
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}>
      <span className='font-bold-24 text-lightgray500 text-center whitespace-pre-line'>{`여기를 클릭해\n문항을 추가해주세요.`}</span>
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
