import { PrevPageButton } from '@components';

interface HeaderProps {
  title: string;
  description?: string;
}

const Header = ({ title, description }: HeaderProps) => {
  return (
    <header>
      <PrevPageButton />
      <div className='mt-[4.8rem] flex items-center gap-[2.4rem]'>
        <h1 className='font-bold-32'>{title}</h1>
        <p className='font-medium-16 text-midgray100 whitespace-pre-line'>{description}</p>
      </div>
    </header>
  );
};

export default Header;
