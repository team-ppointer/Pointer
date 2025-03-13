import Link from 'next/link';
import { IcHome } from '@svg';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  return (
    <header className='bg-background fixed inset-0 z-40 flex h-[6rem] items-center justify-between px-[2rem]'>
      <Link href='/' className='flex w-1/3 items-center'>
        <IcHome width={36} height={36} />
      </Link>
      <h1 className='font-medium-16 flex w-1/3 items-center justify-center text-black'>{title}</h1>
      <div className='w-1/3'></div>
    </header>
  );
};

export default Header;
