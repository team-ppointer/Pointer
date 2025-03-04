interface LabelAndText {
  label: string;
  text: string;
}

interface ProblemPreviewProps {
  title: string;
  memo: string;
  imgSrc: string;
}

const LabelAndText = ({ label, text }: LabelAndText) => {
  return (
    <div className='flex gap-[0.8rem]'>
      <div className='font-medium-12 bg-lightgray300 text-midgray200 flex h-[2.1rem] w-[6.7rem] min-w-[6.7rem] items-center justify-center truncate rounded-[4px]'>
        {label}
      </div>
      <span className='font-medium-14 truncate text-black'>{text}</span>
    </div>
  );
};

const ProblemPreview = ({ title, memo, imgSrc }: ProblemPreviewProps) => {
  return (
    <div className='flex w-[48rem] min-w-[28rem] flex-col gap-[1.6rem]'>
      <div className='flex flex-col gap-[0.8rem]'>
        <LabelAndText label='문항 타이틀' text={title} />
        <LabelAndText label='문항 메모' text={memo} />
      </div>
      <div>
        <img
          src={imgSrc ? imgSrc : '/images/image-placeholder.svg'}
          alt='problem-thumbnail'
          className='h-[23rem] w-full object-contain'
        />
      </div>
    </div>
  );
};

export default ProblemPreview;
