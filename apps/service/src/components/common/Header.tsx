'use client';
import { IcHome, IcLeft } from '@svg';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  iconType?: 'home' | 'back';
}

const Header = ({ title, iconType = 'home' }: HeaderProps) => {
  const router = useRouter();
  return (
    <header className='bg-background fixed inset-0 z-40 flex h-[6rem] items-center justify-between px-[2rem]'>
      <div className='flex w-1/6 items-center'>
        {iconType === 'home' && <IcHome width={24} height={24} onClick={() => router.push('/')} />}
        {iconType === 'back' && <IcLeft width={24} height={24} onClick={() => router.back()} />}
      </div>

      <h1 className='font-bold-16 flex w-2/3 items-center justify-center text-black'>{title}</h1>
      <div className='w-1/6'></div>
    </header>
  );
};

export default Header;
