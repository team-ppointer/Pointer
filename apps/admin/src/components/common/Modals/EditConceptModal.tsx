import { Button, SearchInput } from '@components';
import { IcCloseCircle, IcDown, IcUp } from '@svg';
import { useState, useEffect } from 'react';
import { getConceptCategory, postConcept, postConceptCategory, putConcept } from '@apis';

import type { components } from '@/types/api/schema';

interface Props {
  onClose: () => void;
  onSave: () => void;
  concept?: components['schemas']['ConceptResp'] | null;
}

const EditConceptModal = ({ onClose, onSave, concept }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conceptName, setConceptName] = useState<string>('');
  const { data: conceptCategories } = getConceptCategory();
  const [selectedConceptCategory, setSelectedConceptCategory] = useState<number | undefined>(
    undefined
  );
  const postConceptMutation = postConcept();
  const postConceptCategoryMutation = postConceptCategory();
  const putConceptMutation = putConcept();

  const isEditMode = Boolean(concept);

  useEffect(() => {
    if (concept) {
      // 수정 모드일 때 기존 값으로 초기화
      setConceptName(concept.name);
      setSelectedConceptCategory(concept.category.id);
      setSearchQuery('');
    } else {
      // 생성 모드일 때 초기화
      setConceptName('');
      setSelectedConceptCategory(undefined);
      setSearchQuery('');
    }
    setIsOpen(false);
  }, [concept]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectConceptCategory = (
    _e: React.MouseEvent<HTMLDivElement>,
    conceptCategoryId: number | undefined
  ) => {
    setSelectedConceptCategory(conceptCategoryId);
    toggleOpen();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSave = async () => {
    // 개념 태그 이름 유효성 검사
    if (!conceptName.trim()) {
      alert('개념 태그 이름을 입력해주세요.');
      return;
    }

    try {
      let categoryId = selectedConceptCategory;

      // 대분류가 선택되지 않았지만 입력값이 있는 경우
      if (!categoryId && searchQuery.trim()) {
        // 기존 대분류 중에 같은 이름이 있는지 확인
        const existingCategory = conceptCategories?.data.find(
          (category) => category.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );

        if (existingCategory) {
          // 기존 대분류가 있으면 자동으로 선택
          categoryId = existingCategory.id;
          setSelectedConceptCategory(existingCategory.id);
        } else {
          // 기존 대분류가 없으면 새로 생성
          const categoryResponse = await postConceptCategoryMutation.mutateAsync({
            body: {
              name: searchQuery.trim(),
            },
          });
          categoryId = categoryResponse.id;
        }
      }

      if (!categoryId) {
        alert('개념 태그 대분류를 선택하거나 입력해주세요.');
        return;
      }

      if (isEditMode && concept) {
        // 수정 모드
        await putConceptMutation.mutateAsync({
          body: {
            name: conceptName.trim(),
            categoryId: categoryId,
          },
          params: {
            path: {
              conceptId: concept.id,
            },
          },
        });
      } else {
        // 생성 모드
        await postConceptMutation.mutateAsync({
          body: {
            name: conceptName.trim(),
            categoryId: categoryId,
          },
        });
      }

      onSave();
    } catch (error) {
      console.error('개념 태그 처리 중 오류가 발생했습니다:', error);
      alert('개념 태그 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <div className='w-4xl px-1600 py-1200'>
        <h2 className='font-bold-24 text-black'>
          {isEditMode ? '개념 태그 수정' : '개념 태그 등록'}
        </h2>
        <form className='mt-16 flex flex-col gap-800' onSubmit={() => {}}>
          <div className='flex flex-col gap-300'>
            <span className='font-medium-18 text-black'>개념 태그 대분류</span>
            <div className='relative h-[5.6rem] w-full'>
              <div
                className={`border-lightgray500 rounded-400 absolute z-30 flex min-h-[5.6rem] w-full flex-col justify-center border bg-white px-400 py-800`}>
                <div className='flex min-h-[4rem] items-center justify-between gap-[0.9rem]'>
                  {selectedConceptCategory ? (
                    <span className='font-medium-18'>
                      {
                        conceptCategories?.data.find(
                          (conceptCategory) => conceptCategory.id === selectedConceptCategory
                        )?.name
                      }
                    </span>
                  ) : (
                    <input
                      // {...register('search')}
                      className='font-medium-18 outline-none'
                      placeholder={'입력해주세요'}
                      onFocus={() => setIsOpen(true)}
                      onChange={handleSearch}
                      value={searchQuery}
                    />
                  )}

                  <div className='flex items-center gap-200'>
                    {selectedConceptCategory && (
                      <div onClick={(e) => handleSelectConceptCategory(e, undefined)}>
                        <IcCloseCircle width={24} height={24} className='cursor-pointer' />
                      </div>
                    )}
                    {isOpen ? (
                      <IcUp
                        width={24}
                        height={24}
                        onClick={toggleOpen}
                        className='cursor-pointer'
                      />
                    ) : (
                      <IcDown
                        width={24}
                        height={24}
                        onClick={toggleOpen}
                        className='cursor-pointer'
                      />
                    )}
                  </div>
                </div>
                {isOpen && (
                  <>
                    <div className='bg-lightgray500 mt-200 mb-[1rem] h-[1px] w-full' />
                    <div>
                      <div className='flex flex-col gap-300'>
                        {conceptCategories?.data
                          .filter((conceptCategory) => conceptCategory.name.includes(searchQuery))
                          .map((conceptCategory) => (
                            <div
                              key={conceptCategory.id}
                              className='font-medium-14 cursor-pointer text-black'
                              onClick={(e) => handleSelectConceptCategory(e, conceptCategory.id)}>
                              {conceptCategory.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <SearchInput
            sizeType='full'
            label='개념 태그 이름'
            placeholder='입력해주세요.'
            value={conceptName}
            onChange={(e) => setConceptName(e.target.value)}
          />
          <div className='mt-[5.6rem] flex justify-end gap-400'>
            <Button type='button' variant='light' onClick={onClose}>
              취소
            </Button>
            <Button type='button' variant='dark' onClick={handleSave}>
              {isEditMode ? '수정' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditConceptModal;
