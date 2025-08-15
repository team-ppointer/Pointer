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
    <div className='flex gap-200'>
      <div className='font-medium-12 bg-lightgray300 text-midgray200 rounded-100 flex h-[2.1rem] w-[6.7rem] min-w-[6.7rem] items-center justify-center truncate'>
        {label}
      </div>
      <span className='font-medium-14 truncate text-black'>{text}</span>
    </div>
  );
};

const ProblemPreview = ({ title, memo, imgSrc }: ProblemPreviewProps) => {
  return (
    <div className='flex w-[48rem] min-w-[28rem] flex-col gap-400'>
      <div className='flex flex-col gap-200'>
        <LabelAndText label='문제 타이틀' text={title} />
        <LabelAndText label='문제 메모' text={memo} />
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
