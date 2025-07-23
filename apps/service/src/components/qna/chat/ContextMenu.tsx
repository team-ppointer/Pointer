const ContextMenu = () => {
  return (
    <div className='absolute right-0 z-100 mt-2 rounded-[1.6rem] bg-white'>
      <div className='flex flex-col items-center justify-center gap-[1.6rem] px-[1.6rem] py-[1.3rem]'>
        <button className='font-medium-16 flex items-center justify-center gap-[0.8rem]'>
          수정
        </button>
        <button className='font-medium-16 flex items-center justify-center gap-[0.8rem]'>
          삭제
        </button>
        <button className='font-medium-16 flex items-center justify-center gap-[0.8rem]'>
          복사
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;
