import { PropsWithChildren } from 'react';

const YourChat = ({ children }: PropsWithChildren) => {
  return (
    <div className='flex w-full flex-col items-start justify-start pr-[2rem]'>
      <div className='flex max-w-full flex-col items-center justify-start rounded-tl-[0.4rem] rounded-tr-[1.6rem] rounded-b-[1.6rem] bg-white px-[2rem] py-[1.6rem]'>
        {children}
      </div>
    </div>
  );
};
export default YourChat;
