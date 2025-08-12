import { IconButton } from '@components';
import { IcTagCheck16 } from '@svg';

interface Props {
  name: string;
  isChecked: boolean;
  toggleTag: (tag: string) => void;
  onDelete?: () => void;
  onModify?: () => void;
}

const ConceptTagCard = ({ name, isChecked, toggleTag, onDelete, onModify }: Props) => {
  return (
    <section className='rounded-400 flex w-full justify-between bg-white px-600 py-400'>
      <label className='flex cursor-pointer items-center gap-400'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={() => toggleTag(name)}
          className='peer hidden'
        />
        <div className='bg-lightgray300 rounded-100 flex h-[3.6rem] w-[3.6rem] items-center justify-center'>
          <IcTagCheck16 width={17} height={12} className={isChecked ? 'visible' : 'invisible'} />
        </div>
        <span className='font-medium-16 text-black'>{name}</span>
      </label>
      <div className='flex items-center gap-200'>
        <IconButton variant='delete' onClick={onDelete} />
        <IconButton variant='modify' onClick={onModify} />
      </div>
    </section>
  );
};

export default ConceptTagCard;
