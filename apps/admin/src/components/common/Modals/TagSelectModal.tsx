import { getConcept } from '@apis';
import { Button, Input, Tag } from '@components';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Tag as TagIcon, RotateCcw } from 'lucide-react';

interface TagSelectModalProps {
  onClose: () => void;
  selectedTagList: number[];
  handleChangeTagList: (tagList: number[]) => void;
}

const TagSelectModal = ({ onClose, selectedTagList, handleChangeTagList }: TagSelectModalProps) => {
  const [modalSelectedTag, setModalSelectedTag] = useState<number[]>(selectedTagList);
  const { data: tagsData } = getConcept();
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
    <div className='flex w-[70dvw] max-w-4xl flex-col gap-6 px-8 py-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
          <TagIcon className='h-5 w-5 text-white' />
        </div>
        <h2 className='text-xl font-bold text-gray-900'>문제 개념 태그 검색</h2>
      </div>

      {/* Search and Actions */}
      <div className='flex w-full items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <Input
            {...register('searchInput')}
            placeholder='개념 태그를 입력해주세요'
            className='pl-10'
          />
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => setModalSelectedTag([])}
            className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
            <RotateCcw className='h-4 w-4' />
            초기화
          </button>
          <button
            onClick={handleClickApply}
            className='bg-main hover:bg-main/90 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200'>
            적용
          </button>
        </div>
      </div>

      {/* Selected Tags Section */}
      {modalSelectedTag.length > 0 && (
        <div className='rounded-xl border border-gray-200 bg-gray-50 p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <span className='text-sm font-semibold text-gray-700'>선택된 태그</span>
            <span className='bg-main inline-flex h-5 min-w-5 items-center justify-center rounded-lg px-2 text-xs font-bold text-white'>
              {modalSelectedTag.length}
            </span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {modalSelectedTag.map((tag) => (
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
        </div>
      )}

      {/* Available Tags Section */}
      <div className='flex flex-col gap-3'>
        <span className='text-sm font-semibold text-gray-700'>
          {searchValue ? '검색 결과' : '전체 태그'}
        </span>
        <div className='max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4'>
          {searchedTagList.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {searchedTagList.map((tag) => (
                <Tag
                  key={tag.id}
                  label={tag.name}
                  onClick={() => {
                    setModalSelectedTag((prev) => [...prev, tag.id]);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className='flex h-32 items-center justify-center'>
              <p className='text-sm font-medium text-gray-400'>
                {searchValue ? '검색 결과가 없습니다' : '태그가 없습니다'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagSelectModal;
