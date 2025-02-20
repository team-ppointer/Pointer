import { TagType } from '@types';
import { useState } from 'react';

const allTagList = [
  { id: 1, name: '태그1입니다' },
  { id: 2, name: '태그2입니다' },
  { id: 3, name: '태그3입니다' },
  { id: 4, name: '태그4입니다' },
  { id: 5, name: '태그5입니다' },
  { id: 6, name: '태그6입니다' },
  { id: 7, name: '태그7입니다' },
  { id: 8, name: '태그8입니다' },
  { id: 9, name: '태그9입니다' },
  { id: 10, name: '태그10입니다' },
];

const useSelectTag = (selectedTagList?: TagType[]) => {
  // const { data: allTagList } = getConceptTags();

  const [selectedList, setSelectedList] = useState(selectedTagList || []);
  const unselectedList = (allTagList || []).filter(
    (tag) => !selectedList?.find((selectedTag) => selectedTag.id === tag.id)
  );

  const onClickSelectTag = (tag: TagType) => setSelectedList((prev) => [...prev, tag]);

  const onClickRemoveTag = (tag: TagType) => {
    setSelectedList((prevList) => {
      const newList = prevList.filter((prevTag) => prevTag.id !== tag.id);
      return newList;
    });
  };

  return {
    selectedList,
    unselectedList,
    onClickSelectTag,
    onClickRemoveTag,
  };
};

export default useSelectTag;
