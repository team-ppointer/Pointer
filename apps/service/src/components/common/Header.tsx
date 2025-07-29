'use client';
import { usePathname, useRouter } from 'next/navigation';

import { trackEvent } from '@utils';
import { IcCloseBig, IcHome, IcLeft, IcMenu } from '@svg';

interface HeaderProps {
  title: string;
  iconType?: 'home' | 'back' | 'menu' | 'none';
  rightIconType?: 'close' | 'none';
  menuOnClick?: () => void;
}

const Header = ({ title, iconType = 'home', rightIconType = 'none', menuOnClick }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isTeacherPage = pathname.includes('/teacher');

  const handleClickHome = () => {
    trackEvent('header_home_button_click');
    if (isTeacherPage) {
      router.push('/teacher');
      return;
    }
    router.push('/');
  };

  return (
    <header className='bg-background fixed inset-0 z-40 mx-auto flex h-[6rem] max-w-[768px] items-center justify-between px-[2rem]'>
      <div className='flex w-1/6 cursor-pointer items-center'>
        {iconType === 'home' && <IcHome width={24} height={24} onClick={handleClickHome} />}
        {iconType === 'menu' && (
          <IcMenu
            width={24}
            height={24}
            onClick={() => {
              console.log('Menu icon clicked');
              menuOnClick?.();
            }}
          />
        )}
        {iconType === 'back' && <IcLeft width={24} height={24} onClick={() => router.back()} />}
        {iconType === 'none' && <div className='h-6 w-6' />}
      </div>

      <h1 className='font-bold-16 flex w-2/3 items-center justify-center text-black'>{title}</h1>
      <div className='flex w-1/6 cursor-pointer items-center justify-end'>
        {rightIconType === 'close' && (
          <IcCloseBig width={24} height={24} onClick={() => router.replace('/')} />
        )}
      </div>
    </header>
  );
};

export default Header;
