'use client';
import { useRouter } from 'next/navigation';

import { trackEvent } from '@utils';
import { IcHome, IcLeft } from '@svg';

interface HeaderProps {
  title: string;
  iconType?: 'home' | 'back';
}

const Header = ({ title, iconType = 'home' }: HeaderProps) => {
  const router = useRouter();

  const handleClickHome = () => {
    trackEvent('header_home_button_click');
    router.push('/');
  };

  return (
    <header className='bg-background fixed inset-0 z-40 mx-auto flex h-[6rem] max-w-[768px] items-center justify-between px-[2rem]'>
      <div className='flex w-1/6 cursor-pointer items-center'>
        {iconType === 'home' && <IcHome width={24} height={24} onClick={handleClickHome} />}
        {iconType === 'back' && <IcLeft width={24} height={24} onClick={() => router.back()} />}
      </div>

      <h1 className='font-bold-16 flex w-2/3 items-center justify-center text-black'>{title}</h1>
      <div className='w-1/6'></div>
    </header>
  );
};

export default Header;
