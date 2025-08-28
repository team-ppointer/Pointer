import { Button, DeleteButton, PrevPageButton } from '@components';

interface HeaderProps {
  title: string;
  description?: string;
  deleteButton?: string;
  onClickDelete?: () => void;
  actionButton?: string;
  onClickAction?: () => void;
}

const Header = ({
  title,
  description,
  deleteButton,
  onClickDelete,
  actionButton,
  onClickAction,
}: HeaderProps) => {
  return (
    <header>
      {/* <PrevPageButton /> */}
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-600'>
          <h1 className='font-bold-18'>{title}</h1>
          {description && (
            <p className='font-medium-16 text-midgray100 whitespace-pre-line'>{description}</p>
          )}
        </div>
        {deleteButton && <DeleteButton label={deleteButton} onClick={onClickDelete} />}
        {actionButton && (
          <Button sizeType='fit' variant='dark' onClick={onClickAction}>
            {actionButton}
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
