type Props = {
  label: string;
  value?: string | number;
  className?: string;
};
const AnswerLabel = ({ label, value, className }: Props) => {
  return (
    <div
      className={`flex w-full flex-row justify-between rounded-[1.6rem] bg-white px-[2rem] py-[1.6rem] ${className}`}>
      <span className='font-medium-16 text-[1.4rem] text-[#1E1E21]'>{label}</span>
      <span className='font-bold-16 text-main ml-[0.8rem] text-[1.4rem]'>{value ?? '-'}</span>
    </div>
  );
};

export default AnswerLabel;
