import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  EditCategoryModal,
  EditConceptModal,
  Header,
  Input,
  Modal,
  TwoButtonModalTemplate,
} from '@components';
import { useForm } from 'react-hook-form';
import { getConcept, getConceptCategory, deleteConcept, putConceptCategory } from '@apis';
import { useModal, useInvalidate } from '@hooks';
import {
  Search,
  Plus,
  Trash2,
  X,
  PackageOpen,
  FolderOpen,
  CheckCircle2,
  Pencil,
  Filter,
  Box,
  RotateCcw,
} from 'lucide-react';

import { ConceptTagCard } from '@/components/conceptTags';
import type { components } from '@/types/api/schema';

export const Route = createFileRoute('/_GNBLayout/concept-tags/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedTag, setSelectedTag] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedConceptForDelete, setSelectedConceptForDelete] = useState<number | null>(null);
  const [selectedConceptForEdit, setSelectedConceptForEdit] = useState<
    components['schemas']['ConceptResp'] | null
  >(null);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<
    components['schemas']['ConceptCategoryResp'] | null
  >(null);
  const [isMultipleDelete, setIsMultipleDelete] = useState<boolean>(false);
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const {
    isOpen: isEditConceptModalOpen,
    openModal: openEditConceptModal,
    closeModal: closeEditConceptModal,
  } = useModal();
  const {
    isOpen: isEditCategoryModalOpen,
    openModal: openEditCategoryModal,
    closeModal: closeEditCategoryModal,
  } = useModal();

  // api
  const { data: concepts } = getConcept({ query: searchQuery });
  const { data: conceptCategories } = getConceptCategory();
  const { mutateAsync: updateCategoryAsync } = putConceptCategory();
  const { invalidateAll } = useInvalidate();
  const deleteConceptMutation = deleteConcept();

  const toggleTag = (tag: number) => {
    setSelectedTag((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const { register, handleSubmit, watch, reset } = useForm<{
    query: string;
  }>();

  const watchedQuery = watch('query');
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchQuery((watchedQuery ?? '').trim());
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [watchedQuery]);

  const handleClickSearch = (data: { query: string }) => {
    setSearchQuery(data.query.trim());
    setSelectedTag([]);
  };

  const handleResetQuery = () => {
    reset();
    setSearchQuery('');
    setSelectedTag([]);
    setSelectedCategory(null);
  };

  const handleConfirmDelete = async () => {
    try {
      if (isMultipleDelete) {
        // 선택된 태그들 삭제
        await Promise.all(
          selectedTag.map((conceptId) =>
            deleteConceptMutation.mutateAsync({
              params: {
                path: {
                  conceptId,
                },
              },
            })
          )
        );
        setSelectedTag([]);
        alert('선택된 개념 태그들이 삭제되었습니다.');
      } else if (selectedConceptForDelete) {
        // 개별 태그 삭제
        await deleteConceptMutation.mutateAsync({
          params: {
            path: {
              conceptId: selectedConceptForDelete,
            },
          },
        });
        setSelectedConceptForDelete(null);
      }

      invalidateAll();
      closeDeleteModal();
      setIsMultipleDelete(false);
    } catch (error) {
      console.error('개념 태그 삭제 중 오류가 발생했습니다:', error);
      alert('개념 태그 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSelectedConcepts = () => {
    if (selectedTag.length === 0) {
      alert('삭제할 개념 태그를 선택해주세요.');
      return;
    }
    setIsMultipleDelete(true);
    openDeleteModal();
  };

  // 필터링된 개념들
  const filteredConcepts = concepts?.data.filter((concept) =>
    selectedCategory ? concept.category.id === selectedCategory : true
  );

  // 총 개념 수 및 선택 가능한 카테고리들
  const availableCategories =
    conceptCategories?.data.filter((category) =>
      concepts?.data.some((concept) => concept.category.id === category.id)
    ) || [];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <Header title='개념 태그'>
        <Header.Button
          Icon={Plus}
          color='main'
          onClick={() => {
            setSelectedConceptForEdit(null);
            openEditConceptModal();
          }}>
          개념 태그 등록
        </Header.Button>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        {/* Search & Filter Card */}
        <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          <div className='px-6 pt-6'>
            <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
              <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                <Search className='h-5 w-5 text-white' />
              </div>
              개념 태그 검색
            </h2>
          </div>

          <div className='space-y-6 p-8'>
            {/* Search Input */}
            <form onSubmit={handleSubmit(handleClickSearch)}>
              <div className='flex items-end gap-4'>
                <div className='flex-1'>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>
                    개념 태그 검색
                  </label>
                  <Input
                    placeholder='개념 태그 이름으로 검색...'
                    {...register('query', { required: false })}
                  />
                </div>
                <button
                  type='button'
                  onClick={handleResetQuery}
                  className='flex h-[45.8px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                  <RotateCcw className='h-4 w-4' />
                  초기화
                </button>
              </div>
            </form>

            {/* Category Filter */}
            <div className='border-t border-gray-100 pt-6'>
              <div className='mb-3 flex items-center gap-2'>
                <Filter className='h-4 w-4 text-gray-600' />
                <label className='text-sm font-semibold text-gray-700'>카테고리 필터</label>
              </div>
              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => setSelectedCategory(null)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === null
                      ? 'bg-main border-main text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <Box className='h-4 w-4' />
                  전체 ({concepts?.data.length || 0})
                </button>
                {availableCategories.map((category) => {
                  const count = concepts?.data.filter((c) => c.category.id === category.id).length;
                  return (
                    <button
                      key={category.id}
                      type='button'
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-main border-main text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <FolderOpen className='h-4 w-4' />
                      {category.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className='mb-6 flex h-12 flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium text-gray-600'>
              {filteredConcepts?.length || 0}개
            </span>
            {selectedTag.length > 0 && (
              <>
                <div className='h-6 w-px bg-gray-300' />
                <div className='bg-main/10 text-main flex items-center gap-2 rounded-lg px-3 py-1.5'>
                  <CheckCircle2 className='h-4 w-4' />
                  <span className='text-sm font-semibold'>{selectedTag.length}개 선택</span>
                </div>
              </>
            )}
          </div>
          {selectedTag.length > 0 && (
            <div className='flex gap-3'>
              <button
                type='button'
                onClick={() => setSelectedTag([])}
                className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                <X className='h-4 w-4' />
                선택 해제
              </button>
              <button
                type='button'
                onClick={handleDeleteSelectedConcepts}
                className='flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50'>
                <Trash2 className='h-4 w-4' />
                선택 삭제 ({selectedTag.length})
              </button>
            </div>
          )}
        </div>

        {/* Concept Grid */}
        {filteredConcepts && filteredConcepts.length > 0 ? (
          <div className='space-y-6'>
            {availableCategories
              .filter((category) => (selectedCategory ? category.id === selectedCategory : true))
              .map((category) => {
                const categoryConcepts = filteredConcepts.filter(
                  (concept) => concept.category.id === category.id
                );
                if (categoryConcepts.length === 0) return null;

                return (
                  <div
                    key={category.id}
                    className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
                    <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gray-600'>
                          <FolderOpen className='h-4 w-4 text-white' />
                        </div>
                        <h4 className='text-lg font-bold text-gray-900'>{category.name}</h4>
                        <span className='text-main bg-main/10 rounded-lg px-2.5 py-1 text-xs font-bold'>
                          {categoryConcepts.length}개
                        </span>
                      </div>
                      <button
                        type='button'
                        onClick={() => {
                          setSelectedCategoryForEdit(category);
                          openEditCategoryModal();
                        }}
                        className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'>
                        <Pencil className='h-4 w-4' />
                        수정
                      </button>
                    </div>
                    <div className='grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                      {categoryConcepts.map((concept) => {
                        const isChecked = selectedTag.includes(concept.id);
                        return (
                          <ConceptTagCard
                            key={concept.id}
                            name={concept.name}
                            isChecked={isChecked}
                            toggleTag={() => toggleTag(concept.id)}
                            onDelete={() => {
                              setSelectedConceptForDelete(concept.id);
                              setIsMultipleDelete(false);
                              openDeleteModal();
                            }}
                            onModify={() => {
                              setSelectedConceptForEdit(concept);
                              openEditConceptModal();
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* Empty State */
          <div className='flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12'>
            <PackageOpen className='mb-4 h-16 w-16 text-gray-400' />
            <h3 className='mb-2 text-xl font-bold text-gray-900'>
              {searchQuery ? '검색 결과가 없습니다' : '개념 태그가 없습니다'}
            </h3>
            <p className='mb-6 text-center text-sm text-gray-600'>
              {searchQuery ? (
                <>
                  &quot;{searchQuery}&quot; 검색어와 일치하는 개념 태그가 없습니다.
                  <br />
                  다른 검색어로 시도해보거나 새로운 개념 태그를 등록해주세요.
                </>
              ) : (
                <>
                  아직 등록된 개념 태그가 없습니다.
                  <br />
                  새로운 개념 태그를 등록해서 시작해보세요.
                </>
              )}
            </p>
            <button
              type='button'
              onClick={() => {
                setSelectedConceptForEdit(null);
                openEditConceptModal();
              }}
              className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200'>
              <Plus className='h-4 w-4' />새 개념 태그 등록
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          closeDeleteModal();
          setIsMultipleDelete(false);
          setSelectedConceptForDelete(null);
        }}>
        <TwoButtonModalTemplate
          text={
            isMultipleDelete
              ? `선택된 ${selectedTag.length}개의 개념 태그를 삭제할까요?`
              : '개념 태그를 삭제할까요?'
          }
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={() => {
            closeDeleteModal();
            setIsMultipleDelete(false);
            setSelectedConceptForDelete(null);
          }}
          handleClickRightButton={handleConfirmDelete}
        />
      </Modal>
      <Modal isOpen={isEditConceptModalOpen} onClose={closeEditConceptModal}>
        <EditConceptModal
          onClose={closeEditConceptModal}
          onSave={() => {
            invalidateAll();
            closeEditConceptModal();
          }}
          concept={selectedConceptForEdit}
        />
      </Modal>
      <Modal
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          closeEditCategoryModal();
          setSelectedCategoryForEdit(null);
        }}>
        <EditCategoryModal
          onClose={() => {
            closeEditCategoryModal();
            setSelectedCategoryForEdit(null);
          }}
          defaultName={selectedCategoryForEdit ? selectedCategoryForEdit.name : undefined}
          onSubmit={async ({ name }) => {
            if (!selectedCategoryForEdit) return;
            await updateCategoryAsync({
              params: {
                path: { categoryId: selectedCategoryForEdit.id },
              },
              body: { name },
            });
            closeEditCategoryModal();
            setSelectedCategoryForEdit(null);
            invalidateAll();
          }}
        />
      </Modal>
    </div>
  );
}
