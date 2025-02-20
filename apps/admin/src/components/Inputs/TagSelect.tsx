import { IcDown, IcUp } from '@svg';
import { useState } from 'react';
import { Tag } from '@components';
import { getConceptTags } from '@apis';

interface TagSelectProps {
  selectedList: number[];
  handleSelectTag: (tagId: number) => void;
  handleRemoveTag: (tagId: number) => void;
}

const TagSelect = ({ selectedList, handleSelectTag, handleRemoveTag }: TagSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: tagsData } = getConceptTags();
  const allTagList = tagsData?.data;

  const selectedTagList = allTagList?.filter((tag) => selectedList.includes(tag.id));
  const unselectedList = allTagList?.filter((tag) => !selectedList.includes(tag.id));

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleClickSelect = (e: React.MouseEvent<HTMLDivElement>, tagId: number) => {
    e.stopPropagation();
    e.preventDefault();
    handleSelectTag(tagId);
  };

  const handleClickRemove = (e: React.MouseEvent<HTMLDivElement>, tagId: number) => {
    e.stopPropagation();
    e.preventDefault();
    handleRemoveTag(tagId);
  };

  return (
    <div className={`flex w-full flex-col gap-[1.2rem] ${isOpen && 'z-30'}`}>
      <div
        className={`border-lightgray500 w-full rounded-[16px] border bg-white px-[1.6rem] py-[1.35rem]`}>
        <div
          className='flex min-h-[2.4rem] cursor-pointer items-center justify-between gap-[0.9rem]'
          onClick={toggleOpen}>
          {selectedTagList?.length === 0 ? (
            <span className='font-medium-18 text-lightgray500'>선택해주세요</span>
          ) : (
            <div className='flex flex-1 flex-wrap items-center gap-[1.2rem]'>
              {selectedTagList?.map((tag) => (
                <Tag
                  key={tag.id}
                  label={tag.name}
                  removable
                  onClick={(e) => handleClickRemove(e, tag.id)}
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
                  <Tag
                    key={tag.id}
                    label={tag.name}
                    onClick={(e) => handleClickSelect(e, tag.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TagSelect;
