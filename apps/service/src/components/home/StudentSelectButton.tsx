import { IcDoubleArrow, IcProgressGreen } from '@svg';

type Props = {
  name: string;
  onClick: () => void;
};

const StudentSelectButton = ({ onClick, name }: Props) => {
  return (
    <div
      className='flex h-full w-[15rem] cursor-pointer flex-row justify-between gap-[0.4rem] rounded-[16px] bg-white px-[2.4rem] py-[1.6rem]'
      onClick={onClick}>
      <div className='flex flex-row gap-[0.4rem]'>
        <p className='font-medium-16 text-[#1E1E21]'>{name}</p>
      </div>
      <IcDoubleArrow width={24} height={24} />
    </div>
  );
};

export default StudentSelectButton;
