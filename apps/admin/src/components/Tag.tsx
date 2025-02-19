import { IcCloseSmall, IcCloseSmallWhite } from '@svg';

interface TagProps {
  label: string;
  color?: 'light' | 'dark';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  removable?: boolean;
}

const Tag = ({ label, color = 'light', onClick, removable = false }: TagProps) => {
  const colorStyle = {
    light: 'bg-lightgray400 text-black',
    dark: 'bg-darkgray100 text-white',
  };
  return (
    <div
      className={`font-medium-14 flex h-[3.6rem] w-fit cursor-pointer items-center gap-[1rem] rounded-full px-[1.2rem] py-[0.6rem] whitespace-nowrap ${colorStyle[color]}`}
      onClick={onClick}>
      {label}
      {removable &&
        (color === 'light' ? (
          <IcCloseSmall width={24} height={24} />
        ) : (
          <IcCloseSmallWhite width={24} height={24} />
        ))}
    </div>
  );
};

export default Tag;
