import { IcTrashBlack } from '@svg';

type DeleteButtonProps = {
  onClick: () => void;
};
const DeleteButton = ({ onClick }: DeleteButtonProps) => {
  return (
    <button
      onClick={onClick}
      className='font-medium-14 border-lightgray500 absolute top-[-3.2rem] right-0 flex h-fit w-fit items-center justify-center gap-[0.6rem] rounded-[0.8rem] border-[0.1rem] bg-white px-[1.2rem] py-[0.6rem]'>
      <IcTrashBlack width={13} height={14} />
      삭제
    </button>
  );
};

export default DeleteButton;
