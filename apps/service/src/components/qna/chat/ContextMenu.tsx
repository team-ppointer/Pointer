import { IcCopyBig, IcPencil } from '@svg';

type ContextMenuProps = {
  modifyOnClick?: () => void;
  copyOnClick?: () => void;
};
const ContextMenu = ({ modifyOnClick, copyOnClick }: ContextMenuProps) => {
  return (
    <div className='absolute right-[2rem] z-100 mt-[0.8rem] rounded-[1.6rem] bg-white'>
      <div className='flex flex-col items-center justify-center gap-[1.6rem] px-[1.6rem] py-[1.3rem]'>
        <button
          className='font-medium-16 flex items-center justify-center gap-[0.8rem]'
          onClick={modifyOnClick}>
          <IcPencil width={24} height={24} />
          수정
        </button>
        <button
          className='font-medium-16 flex items-center justify-center gap-[0.8rem]'
          onClick={copyOnClick}>
          <IcCopyBig width={24} height={24} />
          복사
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;
