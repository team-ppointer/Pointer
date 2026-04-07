import { Button, Input } from '@components';
import { X, ChevronDown, ChevronUp, FolderPlus, Tag as TagIcon, AlertCircle } from 'lucide-react';
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
    <div className='w-[560px] rounded-2xl bg-white p-8'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30'>
            <TagIcon className='h-5 w-5 text-white' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>
            {isEditMode ? '개념 태그 수정' : '새 개념 태그 등록'}
          </h2>
        </div>
      </div>

      <form
        className='space-y-6'
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}>
        {/* Category Selection */}
        <div className='space-y-2'>
          <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
            <FolderPlus className='h-4 w-4' />
            카테고리
          </label>
          <div className='relative'>
            <div
              className={`focus-within:border-main focus-within:ring-main/20 relative rounded-xl border-2 bg-white transition-all duration-200 focus-within:ring-4 ${
                isOpen ? 'border-main ring-main/20 ring-4' : 'border-gray-200'
              }`}>
              <div className='flex items-center justify-between px-4 py-3'>
                {selectedConceptCategory ? (
                  <span className='text-sm font-medium text-gray-900'>
                    {
                      conceptCategories?.data.find(
                        (conceptCategory) => conceptCategory.id === selectedConceptCategory
                      )?.name
                    }
                  </span>
                ) : (
                  <input
                    className='w-full text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400'
                    placeholder='카테고리를 선택하거나 입력해주세요'
                    onFocus={() => setIsOpen(true)}
                    onChange={handleSearch}
                    value={searchQuery}
                  />
                )}

                <div className='flex items-center gap-2'>
                  {selectedConceptCategory && (
                    <button
                      type='button'
                      onClick={(e) => handleSelectConceptCategory(e, undefined)}
                      className='flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
                      <X className='h-4 w-4' />
                    </button>
                  )}
                  <button
                    type='button'
                    onClick={toggleOpen}
                    className='text-main flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-blue-50'>
                    {isOpen ? (
                      <ChevronUp className='h-5 w-5' />
                    ) : (
                      <ChevronDown className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className='max-h-60 overflow-y-auto border-t border-gray-200 bg-gray-50/50'>
                  {conceptCategories?.data.filter((conceptCategory) =>
                    conceptCategory.name.includes(searchQuery)
                  ).length === 0 ? (
                    <div className='px-4 py-6 text-center'>
                      <AlertCircle className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                      <p className='text-sm font-medium text-gray-600'>검색 결과가 없습니다</p>
                      {searchQuery && (
                        <p className='mt-1 text-xs text-gray-500'>
                          &quot;{searchQuery}&quot; 카테고리가 자동으로 생성됩니다
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className='p-2'>
                      {conceptCategories?.data
                        .filter((conceptCategory) => conceptCategory.name.includes(searchQuery))
                        .map((conceptCategory) => (
                          <button
                            key={conceptCategory.id}
                            type='button'
                            onClick={(e) => handleSelectConceptCategory(e, conceptCategory.id)}
                            className={`hover:bg-main/10 hover:text-main w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${
                              selectedConceptCategory === conceptCategory.id
                                ? 'bg-main/10 text-main'
                                : 'text-gray-700'
                            }`}>
                            {conceptCategory.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Concept Name Input */}
        <div className='space-y-2'>
          <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
            <TagIcon className='h-4 w-4' />
            개념 태그 이름
          </label>
          <Input
            placeholder='개념 태그 이름을 입력해주세요'
            value={conceptName}
            onChange={(e) => setConceptName(e.target.value)}
            autoFocus={isEditMode}
          />
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-3 pt-4'>
          <Button type='button' variant='light' onClick={onClose}>
            취소
          </Button>
          <Button type='submit' variant='dark'>
            {isEditMode ? '수정 완료' : '등록하기'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditConceptModal;
