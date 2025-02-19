import { getConceptTags } from '@apis';
import { Button, Input, Tag } from '@components';
import { TagType } from '@types';
import { useState } from 'react';

interface TagSelectModalProps {
  onClose: () => void;
  selectedTagList: TagType[];
  handleChangeTagList: (tagList: TagType[]) => void;
}

const TagSelectModal = ({ onClose, selectedTagList, handleChangeTagList }: TagSelectModalProps) => {
  const [modalSelectedTag, setModalSelectedTag] = useState<TagType[]>(selectedTagList);
  const { data: tagsData } = getConceptTags();
  const [searchValue, setSearchValue] = useState('');

  const allTagList = tagsData?.data || [];
  const unselectedTagList = allTagList.filter((tag) => !modalSelectedTag.includes(tag));
  const searchedTagList = unselectedTagList.filter((tag) => tag.name.includes(searchValue));

  const handleClickApply = () => {
    onClose();
    handleChangeTagList(modalSelectedTag);
  };

  return (
    <div className='flex w-[70dvw] flex-col gap-[3.2rem] px-[6.4rem] py-[4.8rem]'>
      <h2 className='font-bold-24 text-black'>문항 개념 태그 검색</h2>
      <div className='flex w-full items-center justify-between'>
        <div className='w-[42.4rem]'>
          <Input
            placeholder='개념 태그를 입력해주세요.'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className='flex gap-[1.6rem]'>
          <Button type='button' variant='light' onClick={() => setModalSelectedTag([])}>
            초기화
          </Button>
          <Button variant='dark' onClick={handleClickApply}>
            적용
          </Button>
        </div>
      </div>
      {(modalSelectedTag || []).length > 0 && (
        <div className='flex flex-wrap gap-[0.8rem]'>
          {modalSelectedTag?.map((tag) => (
            <Tag
              key={tag.id}
              label={tag.name}
              color='dark'
              removable
              onClick={() => {
                setModalSelectedTag((prev) =>
                  prev.filter((selectedTag) => selectedTag.id !== tag.id)
                );
              }}
            />
          ))}
        </div>
      )}
      <div className='flex flex-wrap gap-[0.8rem]'>
        {searchedTagList?.map((tag) => (
          <Tag
            key={tag.id}
            label={tag.name}
            onClick={() => {
              setModalSelectedTag((prev) => [...prev, tag]);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TagSelectModal;
