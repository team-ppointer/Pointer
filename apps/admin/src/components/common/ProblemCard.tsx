interface ProblemCardProps {
  children: React.ReactNode;
  problemId?: number;
}

const ProblemCard = ({ children }: ProblemCardProps) => {
  return (
    <section className='border-lightgray400 relative flex h-full w-full flex-col gap-[1.2rem] rounded-[0.8rem] border bg-white px-[1.6rem] py-[1.2rem]'>
      {children}
    </section>
  );
};

const CardTextSection = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex flex-col gap-400'>{children}</div>;
};

const CardTitle = ({ customId, title }: { customId: string; title: string }) => {
  return (
    <div className='flex flex-col gap-[0.2rem]'>
      <span className='font-medium-12 text-lightgray500'>문제 타이틀</span>
      <div className='flex gap-[0.4rem]'>
        <span className='font-medium-12 bg-lightgray400 flex-shrink-0 rounded-[0.4rem] px-[0.4rem] py-[0.2rem] text-black'>
          {customId}
        </span>
        <span className='font-medium-14 flex-1 truncate text-black'>{title}</span>
      </div>
    </div>
  );
};

const CardButtonSection = ({ children }: { children: React.ReactNode }) => {
  return <div className='absolute top-[1.2rem] right-[1.6rem] flex'>{children}</div>;
};

const CardInfo = ({ label, content }: { label: string; content?: string }) => {
  return (
    <div className='flex flex-col gap-[0.2rem]'>
      <span className='font-medium-12 text-lightgray500'>{label}</span>
      <span
        className={`font-medium-14 flex-1 ${label === '문제' ? 'line-clamp-2' : 'line-clamp-1'} text-black`}>
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
      className='w-full object-contain'
      style={{ height }}
    />
  );
};

const CardTagSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex gap-400'>
      <span className='font-medium-18 text-midgray200 min-w-[6.7rem]'>개념 태그</span>
      <div className='flex flex-wrap gap-200'>{children}</div>
    </div>
  );
};

const CardEmptyView = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      className='flex h-full w-full cursor-pointer items-center justify-center'
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}>
      <span className='font-bold-24 text-lightgray500 text-center whitespace-pre-line'>{`여기를 클릭해\n문제을 추가해주세요.`}</span>
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
