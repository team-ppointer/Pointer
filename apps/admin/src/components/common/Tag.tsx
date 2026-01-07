import { LucideIcon, TagIcon, X } from 'lucide-react';

interface TagProps {
  icon?: LucideIcon;
  label: string;
  color?: 'light' | 'dark' | 'lightgray' | 'dashed';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  removable?: boolean;
}

const Tag = ({
  icon: Icon = TagIcon,
  label,
  color = 'light',
  onClick,
  removable = false,
}: TagProps) => {
  const colorStyle = {
    light: 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200',
    dark: 'border-main/10 bg-main/10 text-main hover:border-main/40 hover:bg-main/20',
    lightgray: 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50',
    dashed:
      'border-dashed border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-700',
  };

  return (
    <div
      onClick={onClick}
      className={`group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 ${colorStyle[color]}`}>
      <Icon className='h-3.5 w-3.5' />
      {label}
      {removable && <X className='h-3.5 w-3.5 transition-transform duration-200' />}
    </div>
  );
};

export default Tag;
