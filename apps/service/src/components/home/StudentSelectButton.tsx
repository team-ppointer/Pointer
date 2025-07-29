import { IcDoubleArrow, IcProgressGreen } from '@svg';

type Props = {
  onClick: () => void;
};

const StudentSelectButton = ({ onClick }: Props) => {
  return (
    <div
      className='flex h-full w-[15rem] flex-row gap-[0.4rem] rounded-[16px] bg-white px-[2.4rem] py-[1.6rem]'
      onClick={onClick}>
      <p className='font-medium-16 text-[#1E1E21]'>김길동</p>
      <IcProgressGreen width={24} height={24} />
      <IcDoubleArrow width={24} height={24} className='ml-[0.4rem]' />
    </div>
  );
};
export default StudentSelectButton;
