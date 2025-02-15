import { getConceptTags } from '@apis';
import { TagType } from '@types';
import { useState } from 'react';

const useSelectTag = (selectedTagList?: TagType[]) => {
  const { data: allTagList } = getConceptTags();

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
