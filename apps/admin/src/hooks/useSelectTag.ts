import { TagType } from '@types';
import { useState } from 'react';

// 삭제예정
const allTagList = [
  { id: 1, name: '태그1번입니다.' },
  { id: 2, name: '태그2번입니다.' },
  { id: 3, name: '태그3번입니다.' },
  { id: 4, name: '태그4번입니다.' },
  { id: 5, name: '태그5번입니다.' },
  { id: 6, name: '태그6번입니다.' },
  { id: 7, name: '태그7번입니다.' },
  { id: 8, name: '태그8번입니다.' },
  { id: 9, name: '태그9번입니다.' },
  { id: 10, name: '태그10번입니다.' },
];

const useSelectTag = (selectedTagList?: TagType[]) => {
  const [selectedList, setSelectedList] = useState(selectedTagList || []);
  const unselectedList = allTagList.filter(
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
