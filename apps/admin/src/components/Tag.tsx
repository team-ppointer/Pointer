import { IcCloseSmall } from '@svg';

interface TagProps {
  label: string;
  onClick?: () => void;
  onClickRemove?: () => void;
  removable?: boolean;
}

const Tag = ({ label, onClick, onClickRemove, removable = false }: TagProps) => {
  return (
    <div
      className='bg-lightgray400 font-medium-14 flex h-[3.6rem] w-fit cursor-pointer items-center gap-[1rem] rounded-full px-[1.2rem] py-[0.6rem]'
      onClick={removable ? onClickRemove : onClick}>
      {label}
      {removable && <IcCloseSmall width={24} height={24} />}
    </div>
  );
};

export default Tag;
