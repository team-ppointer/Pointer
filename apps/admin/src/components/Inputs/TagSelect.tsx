import { IcDown, IcUp } from '@svg';
import { useState } from 'react';
import { TagType } from '@types';
import { Tag } from '@components';

interface TagSelectProps {
  sizeType?: 'short' | 'long';
  selectedList: TagType[];
  unselectedList: TagType[];
  onClickSelectTag: (tag: TagType) => void;
  onClickRemoveTag: (tag: TagType) => void;
}

const TagSelect = ({
  sizeType = 'short',
  selectedList,
  unselectedList,
  onClickSelectTag,
  onClickRemoveTag,
}: TagSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeStyles = {
    short: 'w-[27.5rem]',
    long: 'w-[55.3rem]',
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleClickSelect = (e: React.MouseEvent<HTMLDivElement>, tag: TagType) => {
    e.stopPropagation();
    onClickSelectTag(tag);
  };

  const handleClickRemove = (e: React.MouseEvent<HTMLDivElement>, tag: TagType) => {
    e.stopPropagation();
    onClickRemoveTag(tag);
  };

  return (
    <div className={`relative ${isOpen && 'z-30'}`}>
      <div className='absolute flex flex-col gap-[1.2rem]'>
        <div
          className={`border-lightgray500 rounded-[16px] border bg-white px-[1.6rem] py-[1.35rem] ${sizeStyles[sizeType]}`}>
          <div
            className='flex min-h-[2.4rem] cursor-pointer items-center justify-between gap-[0.9rem]'
            onClick={toggleOpen}>
            {selectedList?.length === 0 ? (
              <span className='font-medium-18 text-lightgray500'>선택해주세요</span>
            ) : (
              <div className='flex flex-1 flex-wrap items-center gap-[1.2rem]'>
                {selectedList?.map((tag) => (
                  <Tag
                    key={tag.id}
                    label={tag.name}
                    removable
                    onClick={(e) => handleClickRemove(e, tag)}
                  />
                ))}
              </div>
            )}
            {isOpen ? <IcUp width={24} height={24} /> : <IcDown width={24} height={24} />}
          </div>
          {isOpen && (
            <>
              <div className='bg-lightgray500 my-[1rem] h-[1px] w-full' />
              <div>
                <div className='flex flex-1 flex-wrap items-center gap-[1.2rem]'>
                  {unselectedList?.map((tag) => (
                    <Tag key={tag.id} label={tag.name} onClick={(e) => handleClickSelect(e, tag)} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagSelect;
