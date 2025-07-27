import { IconButton } from '@components';
import { IcTagCheck16 } from '@svg';

interface Props {
  name: string;
  isChecked: boolean;
  toggleTag: (tag: string) => void;
}

const ConceptTagCard = ({ name, isChecked, toggleTag }: Props) => {
  return (
    <section className='flex w-full justify-between rounded-[1.6rem] bg-white px-[2.4rem] py-[1.6rem]'>
      <label className='flex cursor-pointer items-center gap-[1.6rem]'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={() => toggleTag(name)}
          className='peer hidden'
        />
        <div className='bg-lightgray300 flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-[0.4rem]'>
          <IcTagCheck16 width={17} height={12} className={isChecked ? 'visible' : 'invisible'} />
        </div>
        <span className='font-medium-16 text-black'>{name}</span>
      </label>
      <div className='flex items-center gap-[0.8rem]'>
        <IconButton variant='delete' onClick={() => {}} />
        <IconButton variant='modify' onClick={() => {}} />
      </div>
    </section>
  );
};

export default ConceptTagCard;
