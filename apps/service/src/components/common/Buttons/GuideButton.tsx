import { IcGuide } from '@svg';

const GuideButton = () => {
  return (
    <button
      type='button'
      className='flex min-w-[12rem] flex-col items-start gap-[0.8rem] rounded-[16px] bg-white px-[2.4rem] py-[2rem]'
      onClick={() => {}}>
      <IcGuide width={24} height={24} />
      <div className='flex flex-col items-start'>
        <span className='font-bold-16'>포인터</span>
        <span className='font-bold-16'>사용설명서</span>
      </div>
    </button>
  );
};

export default GuideButton;
