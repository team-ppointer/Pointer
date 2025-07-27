import { PropsWithChildren } from 'react';

const MyChat = ({ children }: PropsWithChildren) => {
  return (
    <div className='flex w-full flex-col items-end justify-start pl-[2rem]'>
      <div className='bg-main relative flex max-w-full flex-col items-center justify-start rounded-tl-[1.6rem] rounded-tr-[0.4rem] rounded-b-[1.6rem] px-[2rem] py-[1.6rem]'>
        {children}
      </div>
    </div>
  );
};
export default MyChat;
