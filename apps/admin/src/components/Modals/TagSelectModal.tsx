import { getConceptTags } from '@apis';
import { Button, Input, Tag } from '@components';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface TagSelectModalProps {
  onClose: () => void;
  selectedTagList: number[];
  handleChangeTagList: (tagList: number[]) => void;
}

const TagSelectModal = ({ onClose, selectedTagList, handleChangeTagList }: TagSelectModalProps) => {
  const [modalSelectedTag, setModalSelectedTag] = useState<number[]>(selectedTagList);
  const { data: tagsData } = getConceptTags();
  const [searchValue, setSearchValue] = useState('');

  const { register, watch } = useForm({ defaultValues: { searchInput: '' } });
  const searchInput = watch('searchInput');

  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

  const unselectedTagList = allTagList.filter((tag) => !modalSelectedTag.includes(tag.id));
  const searchedTagList = unselectedTagList.filter((tag) => tag.name.includes(searchValue));

  const handleClickApply = () => {
    onClose();
    handleChangeTagList(modalSelectedTag);
  };

  useEffect(() => {
    const debouncedFilter = debounce((value) => {
      setSearchValue(value);
    }, 300);

    debouncedFilter(searchInput);

    return () => debouncedFilter.cancel();
  }, [searchInput]);

  return (
    <div className='flex w-[70dvw] flex-col gap-[3.2rem] px-[6.4rem] py-[4.8rem]'>
      <h2 className='font-bold-24 text-black'>문항 개념 태그 검색</h2>
      <div className='flex w-full items-center justify-between'>
        <div className='w-[42.4rem]'>
          <Input {...register('searchInput')} placeholder='개념 태그를 입력해주세요.' />
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
              key={tag}
              label={tagsNameMap[tag] || ''}
              color='dark'
              removable
              onClick={() => {
                setModalSelectedTag((prev) => prev.filter((selectedTag) => selectedTag !== tag));
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
              setModalSelectedTag((prev) => [...prev, tag.id]);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TagSelectModal;
