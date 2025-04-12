import { DeleteButton, PrevPageButton } from '@components';

interface HeaderProps {
  title: string;
  description?: string;
  deleteButton?: string;
  onClickDelete?: () => void;
}

const Header = ({ title, description, deleteButton, onClickDelete }: HeaderProps) => {
  return (
    <header>
      <PrevPageButton />
      <div className='mt-[4.8rem] flex w-full items-center justify-between'>
        <div className='flex items-center gap-[2.4rem]'>
          <h1 className='font-bold-32'>{title}</h1>
          {description && (
            <p className='font-medium-16 text-midgray100 whitespace-pre-line'>{description}</p>
          )}
        </div>
        {deleteButton && <DeleteButton label={deleteButton} onClick={onClickDelete} />}
      </div>
    </header>
  );
};

export default Header;
