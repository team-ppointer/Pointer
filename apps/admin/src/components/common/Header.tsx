import { useNavigation } from '@hooks';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { LinearBlur } from 'progressive-blur';

interface HeaderProps {
  title: string;
  children: React.ReactNode;
}

const Button = ({
  children,
  Icon,
  color,
  onClick,
}: {
  children: React.ReactNode;
  Icon: LucideIcon;
  color: 'main' | 'gray' | 'destructive';
  onClick: () => void;
}) => {
  const colorStyle = {
    main: 'bg-main shadow-main/20 text-white',
    gray: 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
    destructive:
      'bg-red-50 border border-red-100 shadow-red-500/10 text-red-600 hover:border-red-200 hover:bg-red-100/80',
  };
  return (
    <button
      type='button'
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-2xl py-3 pr-5 pl-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${colorStyle[color]}`}>
      <Icon className={`h-4 w-4 transition-transform duration-300`} />
      {children}
    </button>
  );
};

const Header = ({ title, children }: HeaderProps) => {
  const { goBack } = useNavigation();
  return (
    <header className='sticky top-0 z-30 bg-gradient-to-b from-white/80 to-white/0'>
      <div className='relative z-30 mx-auto max-w-7xl py-8 pr-10 pl-8'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              className='flex items-center justify-center rounded-2xl p-3.5 transition-all duration-300 hover:bg-black/5'
              onClick={goBack}>
              <ArrowLeft className='h-5 w-5' />
            </button>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900'>{title}</h1>
          </div>
          {children}
        </div>
      </div>
      <LinearBlur
        side='top'
        className='pointer-events-none absolute top-0 left-0 z-10 h-[150%] w-full'
      />
    </header>
  );
};

Header.Button = Button;

export { Button };
export default Header;
